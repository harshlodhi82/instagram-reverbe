export interface IUserInfo {
    data: Data
    status: string
}

interface Data {
    user: User
}

interface User {
    biography: string
    bio_links: any[]
    biography_with_entities: BiographyWithEntities
    blocked_by_viewer: boolean
    restricted_by_viewer: boolean
    country_block: boolean
    external_url: any
    external_url_linkshimmed: any
    edge_followed_by: EdgeFollowedBy
    fbid: string
    followed_by_viewer: boolean
    edge_follow: EdgeFollow
    follows_viewer: boolean
    full_name: string
    group_metadata: any
    has_ar_effects: boolean
    has_clips: boolean
    has_guides: boolean
    has_channel: boolean
    has_blocked_viewer: boolean
    highlight_reel_count: number
    has_requested_viewer: boolean
    hide_like_and_view_counts: boolean
    id: string
    is_business_account: boolean
    is_professional_account: boolean
    is_supervision_enabled: boolean
    is_guardian_of_viewer: boolean
    is_supervised_by_viewer: boolean
    is_supervised_user: boolean
    is_embeds_disabled: boolean
    is_joined_recently: boolean
    guardian_id: any
    business_address_json: any
    business_contact_method: string
    business_email: any
    business_phone_number: any
    business_category_name: any
    overall_category_name: any
    category_enum: any
    category_name: any
    is_private: boolean
    is_verified: boolean
    edge_mutual_followed_by: EdgeMutualFollowedBy
    profile_pic_url: string
    profile_pic_url_hd: string
    requested_by_viewer: boolean
    should_show_category: boolean
    should_show_public_contacts: boolean
    show_account_transparency_details: any
    transparency_label: any
    transparency_product: string
    username: string
    connected_fb_page: any
    pronouns: any[]
    edge_felix_combined_post_uploads: EdgeFelixCombinedPostUploads
    edge_felix_combined_draft_uploads: EdgeFelixCombinedDraftUploads
    edge_felix_video_timeline: EdgeFelixVideoTimeline
    edge_felix_drafts: EdgeFelixDrafts
    edge_felix_pending_post_uploads: EdgeFelixPendingPostUploads
    edge_felix_pending_draft_uploads: EdgeFelixPendingDraftUploads
    edge_owner_to_timeline_media: EdgeOwnerToTimelineMedia
    edge_saved_media: EdgeSavedMedia
    edge_media_collections: EdgeMediaCollections
}

interface BiographyWithEntities {
    raw_text: string
    entities: any[]
}

interface EdgeFollowedBy {
    count: number
}

interface EdgeFollow {
    count: number
}

interface EdgeMutualFollowedBy {
    count: number
    edges: any[]
}

interface EdgeFelixCombinedPostUploads {
    count: number
    page_info: PageInfo
    edges: any[]
}

interface PageInfo {
    has_next_page: boolean
    end_cursor: any
}

interface EdgeFelixCombinedDraftUploads {
    count: number
    page_info: PageInfo2
    edges: any[]
}

interface PageInfo2 {
    has_next_page: boolean
    end_cursor: any
}

interface EdgeFelixVideoTimeline {
    count: number
    page_info: PageInfo3
    edges: any[]
}

interface PageInfo3 {
    has_next_page: boolean
    end_cursor: any
}

interface EdgeFelixDrafts {
    count: number
    page_info: PageInfo4
    edges: any[]
}

interface PageInfo4 {
    has_next_page: boolean
    end_cursor: any
}

interface EdgeFelixPendingPostUploads {
    count: number
    page_info: PageInfo5
    edges: any[]
}

interface PageInfo5 {
    has_next_page: boolean
    end_cursor: any
}

interface EdgeFelixPendingDraftUploads {
    count: number
    page_info: PageInfo6
    edges: any[]
}

interface PageInfo6 {
    has_next_page: boolean
    end_cursor: any
}

interface EdgeOwnerToTimelineMedia {
    count: number
    page_info: PageInfo7
    edges: any[]
}

interface PageInfo7 {
    has_next_page: boolean
    end_cursor: any
}

interface EdgeSavedMedia {
    count: number
    page_info: PageInfo8
    edges: any[]
}

interface PageInfo8 {
    has_next_page: boolean
    end_cursor: any
}

interface EdgeMediaCollections {
    count: number
    page_info: PageInfo9
    edges: any[]
}

interface PageInfo9 {
    has_next_page: boolean
    end_cursor: any
}
