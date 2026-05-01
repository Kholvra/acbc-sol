use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::state::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + Config::LEN,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,

    pub system_program: Program<'info, System>,
}

pub fn initialize(ctx: Context<Initialize>, idrx_mint: Pubkey) -> Result<()> {
    let config = &mut ctx.accounts.config;
    config.admin = ctx.accounts.admin.key();
    config.idrx_mint = idrx_mint;
    config.bump = ctx.bumps.config;
    Ok(())
}

#[derive(Accounts)]
#[instruction(campaign_id: u64, title: String, description: String, category: String)]
pub struct CreateCampaign<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + Campaign::LEN,
        seeds = [b"campaign", creator.key().as_ref(), &campaign_id.to_le_bytes()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        seeds = [b"config"],
        bump = config.bump,
    )]
    pub config: Account<'info, Config>,

    #[account(
        init,
        payer = creator,
        token::mint = idrx_mint,
        token::authority = campaign,
        seeds = [b"campaign_vault", campaign.key().as_ref()],
        bump,
    )]
    pub campaign_vault: Account<'info, TokenAccount>,

    pub idrx_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn create_campaign(
    ctx: Context<CreateCampaign>,
    campaign_id: u64,
    title: String,
    description: String,
    category: String,
    target_amount: u64,
) -> Result<()> {
    require!(title.len() <= Campaign::MAX_TITLE_LEN, ErrorCode::TitleTooLong);
    require!(description.len() <= Campaign::MAX_DESC_LEN, ErrorCode::DescriptionTooLong);
    require!(category.len() <= Campaign::MAX_CATEGORY_LEN, ErrorCode::CategoryTooLong);
    require!(target_amount > 0, ErrorCode::InvalidTargetAmount);

    let campaign = &mut ctx.accounts.campaign;
    campaign.creator = ctx.accounts.creator.key();
    campaign.title = title;
    campaign.description = description;
    campaign.category = category;
    campaign.target_amount = target_amount;
    campaign.raised_amount = 0;
    campaign.is_active = true;
    campaign.created_at = Clock::get()?.unix_timestamp;
    campaign.bump = ctx.bumps.campaign;

    Ok(())
}

#[derive(Accounts)]
#[instruction(donation_id: u64)]
pub struct Donate<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,

    #[account(
        mut,
        constraint = campaign.is_active @ ErrorCode::CampaignInactive,
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        mut,
        token::mint = idrx_mint,
        token::authority = donor,
    )]
    pub donor_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = idrx_mint,
        token::authority = campaign,
        seeds = [b"campaign_vault", campaign.key().as_ref()],
        bump,
    )]
    pub campaign_vault: Account<'info, TokenAccount>,

    pub idrx_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = donor,
        space = 8 + Donation::LEN,
        seeds = [b"donation", donor.key().as_ref(), campaign.key().as_ref(), &donation_id.to_le_bytes()],
        bump,
    )]
    pub donation: Account<'info, Donation>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn donate(ctx: Context<Donate>, _donation_id: u64, amount: u64) -> Result<()> {
    require!(amount > 0, ErrorCode::InvalidDonationAmount);

    let cpi_accounts = Transfer {
        from: ctx.accounts.donor_token_account.to_account_info(),
        to: ctx.accounts.campaign_vault.to_account_info(),
        authority: ctx.accounts.donor.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.key(), cpi_accounts);
    token::transfer(cpi_ctx, amount)?;

    let campaign = &mut ctx.accounts.campaign;
    campaign.raised_amount = campaign.raised_amount.checked_add(amount).unwrap();

    let donation = &mut ctx.accounts.donation;
    donation.donor = ctx.accounts.donor.key();
    donation.campaign = ctx.accounts.campaign.key();
    donation.amount = amount;
    donation.timestamp = Clock::get()?.unix_timestamp;
    donation.bump = ctx.bumps.donation;

    Ok(())
}

#[derive(Accounts)]
pub struct CancelCampaign<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        constraint = campaign.creator == creator.key() @ ErrorCode::Unauthorized,
        constraint = campaign.raised_amount == 0 @ ErrorCode::CampaignHasDonations,
    )]
    pub campaign: Account<'info, Campaign>,
}

pub fn cancel_campaign(ctx: Context<CancelCampaign>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    campaign.is_active = false;
    Ok(())
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        constraint = campaign.creator == creator.key() @ ErrorCode::Unauthorized,
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        mut,
        token::mint = idrx_mint,
        token::authority = campaign,
        seeds = [b"campaign_vault", campaign.key().as_ref()],
        bump,
    )]
    pub campaign_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = idrx_mint,
        token::authority = creator,
    )]
    pub creator_token_account: Account<'info, TokenAccount>,

    pub idrx_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
    let campaign = &ctx.accounts.campaign;
    let amount = campaign.raised_amount;

    require!(amount > 0, ErrorCode::NoFundsToWithdraw);

    let campaign_key = campaign.key();
    let seeds = &[
        b"campaign_vault",
        campaign_key.as_ref(),
        &[ctx.bumps.campaign_vault],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.campaign_vault.to_account_info(),
        to: ctx.accounts.creator_token_account.to_account_info(),
        authority: ctx.accounts.campaign_vault.to_account_info(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.key(),
        cpi_accounts,
        signer,
    );
    token::transfer(cpi_ctx, amount)?;

    let campaign = &mut ctx.accounts.campaign;
    campaign.raised_amount = 0;
    campaign.is_active = false;

    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Title exceeds maximum length")]
    TitleTooLong,
    #[msg("Description exceeds maximum length")]
    DescriptionTooLong,
    #[msg("Category exceeds maximum length")]
    CategoryTooLong,
    #[msg("Target amount must be greater than zero")]
    InvalidTargetAmount,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Campaign is inactive")]
    CampaignInactive,
    #[msg("Donation amount must be greater than zero")]
    InvalidDonationAmount,
    #[msg("Campaign has existing donations and cannot be cancelled")]
    CampaignHasDonations,
    #[msg("No funds available to withdraw")]
    NoFundsToWithdraw,
}
