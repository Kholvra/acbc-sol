use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

pub mod state;
pub mod instructions;

pub use state::*;
pub use instructions::*;

declare_id!("CiR2MzoqMxztJzvUsMbZJ3FtPZCZ3DX7WwTnh7FW7Cmn");

#[program]
pub mod aid_beacon {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, idrx_mint: Pubkey) -> Result<()> {
        instructions::initialize(ctx, idrx_mint)
    }

    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        campaign_id: u64,
        title: String,
        description: String,
        category: String,
        target_amount: u64,
    ) -> Result<()> {
        instructions::create_campaign(ctx, campaign_id, title, description, category, target_amount)
    }

    pub fn donate(ctx: Context<Donate>, donation_id: u64, amount: u64) -> Result<()> {
        instructions::donate(ctx, donation_id, amount)
    }

    pub fn cancel_campaign(ctx: Context<CancelCampaign>) -> Result<()> {
        instructions::cancel_campaign(ctx)
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        instructions::withdraw(ctx)
    }
}
