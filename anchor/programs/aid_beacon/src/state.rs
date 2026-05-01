use anchor_lang::prelude::*;

#[account]
pub struct Config {
    pub admin: Pubkey,
    pub idrx_mint: Pubkey,
    pub bump: u8,
}

impl Config {
    pub const LEN: usize = 8 + 32 + 32 + 1;
}

#[account]
pub struct Campaign {
    pub creator: Pubkey,
    pub title: String,
    pub description: String,
    pub category: String,
    pub target_amount: u64,
    pub raised_amount: u64,
    pub is_active: bool,
    pub created_at: i64,
    pub bump: u8,
}

impl Campaign {
    pub const MAX_TITLE_LEN: usize = 100;
    pub const MAX_DESC_LEN: usize = 500;
    pub const MAX_CATEGORY_LEN: usize = 50;
    pub const LEN: usize = 8 + 32 + 4 + Self::MAX_TITLE_LEN + 4 + Self::MAX_DESC_LEN + 4 + Self::MAX_CATEGORY_LEN + 8 + 8 + 1 + 8 + 1;
}

#[account]
pub struct Donation {
    pub donor: Pubkey,
    pub campaign: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
    pub bump: u8,
}

impl Donation {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 1;
}
