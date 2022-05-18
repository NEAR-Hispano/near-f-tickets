use near_contract_standards::non_fungible_token::{ NonFungibleToken };
use near_contract_standards::non_fungible_token::metadata::TokenMetadata as tokenmeta;
use std::collections::HashMap;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, LookupMap, UnorderedMap, UnorderedSet};
use near_sdk::json_types::{Base64VecU8, U128, U64};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, near_bindgen, AccountId, Balance, CryptoHash, PanicOnDefault, Promise, PromiseOrValue, BorshStorageKey, require,
};
use metadata::{ NFTContractMetadata, TokenMetadata };

use crate::internal::*;
pub use crate::metadata::*;
pub use crate::mint::*;
pub use crate::nft_core::*;
pub use crate::approval::*;
pub use crate::royalty::*;
pub use crate::events::*;

mod internal;
mod approval;
mod enumeration;
mod metadata;
mod mint;
mod nft_core;
mod royalty;
mod events;

// Used to delimit Event Title + Ticket Category (eg: Concert - VIP)
pub const TITLE_DELIMETER: &str = " - ";

/// This spec can be treated like a version of the standard.
pub const NFT_METADATA_SPEC: &str = "1.0.0";
/// This is the name of the NFT standard we're using
pub const NFT_STANDARD_NAME: &str = "nep171";

pub type TokenSeriesId = String;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Event {
    name: String,
    description: String,
    modality: u8,
    capacity: u32,
    date: String,
    // time: String,
    status: u8,
    index: i128,
    banner: String,
    organizer: AccountId,
    ticket_type: Vec<String>,
    tickets: Vec<TokenSeriesJson>,
}

#[derive(BorshDeserialize, BorshSerialize)]
// #[serde(crate = "near_sdk::serde")]
pub struct TokenSeries {
	metadata: TokenMetadata,
	creator_id: AccountId,
    tokens: UnorderedSet<TokenId>,
    is_mintable: bool,
    royalty: HashMap<AccountId, u32>,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct TokenSeriesJson {
    token_series_id: TokenSeriesId,
	metadata: TokenMetadata,
	creator_id: AccountId,
    is_mintable: bool,
    // royalty: HashMap<AccountId, u32>,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    tokens: NonFungibleToken,
    //contract owner
    pub owner_id: AccountId,

    //keeps track of all the token IDs for a given account
    pub tokens_per_owner: LookupMap<AccountId, UnorderedSet<TokenId>>,

    //keeps track of the token struct for a given token ID
    pub tokens_by_id: LookupMap<TokenId, Token>,

    //keeps track of the token metadata for a given token ID
    pub token_metadata_by_id: UnorderedMap<TokenId, TokenMetadata>,

    //keeps track of the metadata for the contract
    pub metadata: LazyOption<NFTContractMetadata>,

    // List of created events
    pub events: UnorderedMap<i128, Event>,

    // Stores all created Tickets
    token_series_by_id: UnorderedMap<TokenSeriesId, TokenSeries>,
}

/// Helper structure for keys of the persistent collections.
#[derive(BorshSerialize, BorshStorageKey)]
pub enum StorageKey {
    TokensPerOwner { account_hash: Vec<u8> },
    TokensPerOwnerr,
    TokenPerOwnerInner { account_id_hash: CryptoHash },
    TokensById,
    TokenMetadataById,
    NFTContractMetadata,
    TokensPerType,
    TokensPerTypeInner { token_type_hash: CryptoHash },
    TokenTypesLocked,
    Events,
    TokensBySeriesInner { token_series : String },
    NonFungibleToken,
    TokenMetadata,
    Enumeration,
    Approval,
    TokenSeriesById,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new_default_meta(owner_id: AccountId) -> Self {
        Self::new(
            owner_id,
            NFTContractMetadata {
                spec: NFT_METADATA_SPEC.to_string(),
                name: "NEAR Future Tickets Marketplace".to_string(),
                symbol: "NEAR Future Tickets".to_string(),
                icon: None,
                base_uri: None,
                reference: None,
                reference_hash: None,
            },
        )
    }

    #[init]
    pub fn new(owner_id: AccountId, metadata: NFTContractMetadata) -> Self {
        require!(!env::state_exists(), "Already initialized");
        let this = Self {
            tokens: NonFungibleToken::new(StorageKey::NonFungibleToken, owner_id.clone(), Some(StorageKey::TokenMetadata), Some(StorageKey::Enumeration), Some(StorageKey::Approval),),
            events: UnorderedMap::new(StorageKey::Events),
            tokens_per_owner: LookupMap::new(StorageKey::TokensPerOwnerr),
            tokens_by_id: LookupMap::new(StorageKey::TokensById),
            token_metadata_by_id: UnorderedMap::new(
                StorageKey::TokenMetadataById.try_to_vec().unwrap(),
            ),
            owner_id,
            metadata: LazyOption::new(
                StorageKey::NFTContractMetadata.try_to_vec().unwrap(),
                Some(&metadata),
            ),
            token_series_by_id: UnorderedMap::new(StorageKey::TokenSeriesById),
        };
this
    }

    #[payable]
    // Create an Event and Tickets Structure with their respective capacity (copies)
    pub fn create_event(&mut self,
        name: String,
        description: String,
        modality: u8,
        capacity: Vec<u32>,
        date: String,
        // time: String,
        status: u8,
        banner: String,
        ticket_type: Vec<String>,
        ticket_banners: Vec<String>,
        //we add an optional parameter for perpetual royalties
        perpetual_royalties: Option<HashMap<AccountId, u32>>,
     ) -> Event {
        // Initial storage usage
        let initial_storage_usage = env::storage_usage();
        let caller = env::signer_account_id();
        let index = i128::from(self.events.len() + 1);
        let mut children_token_map = Vec::new();
        let mut metadata = TokenMetadata {
            title: None,
            description: None,
            media: None,
            media_hash: None,
            copies: None,
            issued_at: None,
            expires_at:None,
            starts_at: None,
            updated_at: None,
            extra: None,
            reference: None,
            reference_hash: None,
        };

        // create a royalty map to store in the token
        let mut royalty = HashMap::new();

        // if perpetual royalties were passed into the function:
        if let Some(perpetual_royalties) = perpetual_royalties {
            //make sure that the length of the perpetual royalties is below 7 since we won't have enough GAS to pay out that many people
            assert!(perpetual_royalties.len() < 7, "Cannot add more than 6 perpetual royalty amounts");

            //iterate through the perpetual royalties and insert the account and amount in the royalty map
            for (account, amount) in perpetual_royalties {
                royalty.insert(account, amount);
            }
        }

        let mut total_capacity = 0;

        for (i, _x) in ticket_type.iter().enumerate() {

            let token_series_id = format!("{}", (self.token_series_by_id.len() + 1));

            let title = name.clone();
            metadata.copies = Some(U64(capacity[i].into()).0);
            total_capacity += capacity[i];
            metadata.media = Some(ticket_banners[i].clone());
            let ticket_title = format!("{:?}{}{}", &title , TITLE_DELIMETER , ticket_type[i].clone());
            metadata.title = Some(ticket_title.to_string());

            self.token_series_by_id.insert(&token_series_id, &TokenSeries{
                metadata: metadata.clone(),
                creator_id: caller.clone(),
                tokens: UnorderedSet::new(
                    StorageKey::TokensBySeriesInner {
                        token_series: token_series_id.clone(),
                    }
                    .try_to_vec()
                    .unwrap(),
                ),
                is_mintable: true,
                royalty: royalty.clone(),
            });

            children_token_map.push(TokenSeriesJson{
                metadata: metadata.clone(),
                creator_id: caller.clone(),
                is_mintable: true,
                token_series_id,
            });
        }


        let event = Event {
            name: name,
            description: description,
            modality: modality,
            date: date,
            // time: time,
            status: status,
            index: index,
            banner: banner,
            capacity: total_capacity,
            organizer: caller,
            ticket_type: ticket_type,
            tickets: children_token_map,
        };
        self.events.insert(&event.index, &event);
        let required_storage_in_bytes = env::storage_usage() - initial_storage_usage;
        refund_deposit(required_storage_in_bytes);

        event
    }

    #[payable]
    pub fn mint_ticket(
        &mut self,
        token_series_id: TokenSeriesId,
        receiver_id: AccountId
    ) -> TokenId {
        self.token_series_by_id.get(&token_series_id).expect("Token series not exist");
        // assert_eq!(env::predecessor_account_id(), token_series.creator_id, "not creator");
        let token_id: TokenId = self._nft_mint_series(token_series_id, receiver_id);
        token_id
    }

    fn _nft_mint_series(
        &mut self,
        token_series_id: TokenSeriesId,
        receiver_id: AccountId
    ) -> TokenId {
        let mut token_series = self.token_series_by_id.get(&token_series_id).expect("Token series not exist");
        assert!(
            token_series.is_mintable,
            "Token series is not mintable"
        );

        let num_tokens = token_series.tokens.len();
        let max_copies = token_series.metadata.copies.unwrap_or(u64::MAX);
        assert!(num_tokens < max_copies, "Series supply maxed");

        if (num_tokens + 1) >= max_copies {
            token_series.is_mintable = false;
        }

        let token_id = format!("{}{}{}", &token_series_id, TITLE_DELIMETER, num_tokens + 1);
        token_series.tokens.insert(&token_id);
        self.token_series_by_id.insert(&token_series_id, &token_series);
        let title: String = format!("{:?} - {}{}{}{}", token_series.metadata.title.clone(), TITLE_DELIMETER, &token_series_id, TITLE_DELIMETER, (num_tokens + 1).to_string());


        let metadata = tokenmeta {
            title: Some(title.clone()),
            description: token_series.metadata.description.clone(),
            media: token_series.metadata.media.clone(),
            media_hash: token_series.metadata.media_hash.clone(),
            copies: token_series.metadata.copies.clone(),
            issued_at: Some(env::block_timestamp().to_string()),
            expires_at:None,
            starts_at: None,
            updated_at: None,
            extra: token_series.metadata.extra.clone(),
            reference: token_series.metadata.reference.clone(),
            reference_hash: token_series.metadata.reference_hash.clone(),
        };
        let metadataa = TokenMetadata {
            title: Some(title),
            description: token_series.metadata.description.clone(),
            media: token_series.metadata.media.clone(),
            media_hash: token_series.metadata.media_hash.clone(),
            copies: token_series.metadata.copies.clone(),
            issued_at: Some(env::block_timestamp()),
            expires_at:None,
            starts_at: None,
            updated_at: None,
            extra: token_series.metadata.extra.clone(),
            reference: token_series.metadata.reference.clone(),
            reference_hash: token_series.metadata.reference_hash.clone(),
        };

        let owner_id: AccountId = receiver_id;
        self.tokens.owner_by_id.insert(&token_id, &owner_id);

        self.tokens
            .token_metadata_by_id
            .as_mut()
            .and_then(|by_id| by_id.insert(&token_id, &metadata));

         if let Some(tokens_per_owner) = &mut self.tokens.tokens_per_owner {
             let mut token_ids = tokens_per_owner.get(&owner_id).unwrap_or_else(|| {
                 UnorderedSet::new(StorageKey::TokensPerOwner {
                     account_hash: env::sha256(&owner_id.as_bytes()),
                 })
             });
             token_ids.insert(&token_id);
             tokens_per_owner.insert(&owner_id, &token_ids);
         };

         let token = Token {
            //set the owner ID equal to the receiver ID passed into the function
            owner_id: owner_id.clone(),
            //we set the approved account IDs to the default value (an empty map)
            approved_account_ids: Default::default(),
            //the next approval ID is set to 0
            next_approval_id: 0,
            //the map of perpetual royalties for the token (The owner will get 100% - total perpetual royalties)
            royalty: token_series.royalty,
        };

        //insert the token ID and token struct and make sure that the token doesn't exist
        assert!(
            self.tokens_by_id.insert(&token_id, &token).is_none(),
            "Token already exists"
        );
         //insert the token ID and metadata
         self.token_metadata_by_id.insert(&token_id, &metadataa);

         //call the internal method for adding the token to the owner
         self.internal_add_token_to_owner(&token.owner_id, &token_id);

         // Construct the mint log as per the events standard.
         let nft_mint_log: EventLog = EventLog {
             // Standard name ("nep171").
             standard: NFT_STANDARD_NAME.to_string(),
             // Version of the standard ("nft-1.0.0").
             version: NFT_METADATA_SPEC.to_string(),
             // The data related with the event stored in a vector.
             event: EventLogVariant::NftMint(vec![NftMintLog {
                 // Owner of the token.
                 owner_id: token.owner_id.to_string(),
                 // Vector of token IDs that were minted.
                 token_ids: vec![token_id.to_string()],
                 // An optional memo to include.
                 memo: None,
             }]),
         };

         // Log the serialized json.
         env::log_str(&nft_mint_log.to_string());

        token_id
    }

    // Get All events
    pub fn get_events(self) -> Vec<Event> {
        let event_list = self.events.values_as_vector().to_vec();
        event_list
    }

     // Get Events of a given owner
    //  pub fn get_my_events(self, account_id: AccountId) -> Vec<Event> {
    //     let event_list = self.events.iter().find(|x| x.organizer == account_id);
    //     event_list
    // }

    // Get one event given its id
    pub fn get_event(self, index: i128) -> Event {
        let event = self.events.get(&index).expect("Event Doesn't Exist");
        event
    }

    // Update Event
    #[payable]
    pub fn update_event(&mut self, index: i128, description: String, banner: String, status: u8, date: String) -> Event {
        let mut event = self.events.get(&index).expect("Event Doesn't exist!");
        assert!(event.organizer == env::signer_account_id(), "Signer is not authorized to update this event.");
        event.description = description;
        event.banner = banner;
        event.status = status;
        event.date = date;
        self.events.insert(&index, &event);
        return event;
    }

    // Get Tickets
    pub fn get_event_tickets(
        &self,
        from_index: Option<U128>,
        limit: Option<u64>,
    ) -> Vec<TokenSeriesJson> {
        let start_index: u128 = from_index.map(From::from).unwrap_or_default();
        assert!(
            (self.token_series_by_id.len() as u128) > start_index,
            "Out of bounds, please use a smaller from_index."
        );
        let limit = limit.map(|v| v as usize).unwrap_or(usize::MAX);
        assert_ne!(limit, 0, "Cannot provide limit of 0.");

        self.token_series_by_id
            .iter()
            .skip(start_index as usize)
            .take(limit)
            .map(|(token_series_id, token_series)| TokenSeriesJson{
                token_series_id,
                metadata: token_series.metadata,
                creator_id: token_series.creator_id,
                is_mintable: token_series.is_mintable,
            })
            .collect()
    }
}