export interface IReelConfigureResponse {
    media: Media
    upload_id: string
    status: string
}

interface Media {
    taken_at: number
    pk: string
    id: string
    device_timestamp: number
    client_cache_key: string
    filter_type: number
    caption_is_edited: boolean
    like_and_view_counts_disabled: boolean
    is_reshare_of_text_post_app_media_in_ig: boolean
    media_type: number
    code: string
    can_viewer_reshare: boolean
    caption: Caption
    clips_tab_pinned_user_ids: any[]
    comment_inform_treatment: CommentInformTreatment
    sharing_friction_info: SharingFrictionInfo
    play_count: number
    original_media_has_visual_reply_media: boolean
    can_viewer_save: boolean
    is_in_profile_grid: boolean
    profile_grid_control_enabled: boolean
    is_comments_gif_composer_enabled: boolean
    media_cropping_info: MediaCroppingInfo
    product_suggestions: any[]
    user: User2
    image_versions2: ImageVersions2
    original_width: number
    original_height: number
    is_artist_pick: boolean
    has_hidden_comments: boolean
    comment_threading_enabled: boolean
    max_num_visible_preview_comments: number
    has_more_comments: boolean
    preview_comments: any[]
    comments: any[]
    comment_count: number
    can_view_more_preview_comments: boolean
    hide_view_all_comment_entrypoint: boolean
    is_dash_eligible: number
    video_dash_manifest: string
    video_codec: string
    number_of_qualities: number
    video_versions: VideoVersion[]
    has_audio: boolean
    video_duration: number
    has_liked: boolean
    like_count: number
    facepile_top_likers: any[]
    likers: any[]
    top_likers: any[]
    shop_routing_user_id: any
    can_see_insights_as_brand: boolean
    is_organic_product_tagging_eligible: boolean
    video_subtitles_enabled: boolean
    deleted_reason: number
    integrity_review_decision: string
    has_shared_to_fb: number
    is_unified_video: boolean
    should_request_ads: boolean
    is_visual_reply_commenter_notice_enabled: boolean
    commerciality_status: string
    explore_hide_comments: boolean
    product_type: string
    is_paid_partnership: boolean
    inventory_source: string
    music_metadata: any
    social_context: any[]
    organic_tracking_token: string
    is_third_party_downloads_eligible: boolean
    ig_media_sharing_disabled: boolean
    is_open_to_public_submission: boolean
    has_delayed_metadata: boolean
    clips_metadata: ClipsMetadata
    logging_info_token: string
    enable_waist: boolean
    view_state_item_type: number
}

interface Caption {
    did_report_as_spam: boolean
    is_covered: boolean
    is_ranked_comment: boolean
    media_id: string
    pk: string
    user_id: string
    user: User
    type: number
    text: string
    created_at: number
    created_at_utc: number
    content_type: string
    status: string
    bit_flags: number
    share_enabled: boolean
    private_reply_status: number
}

interface User {
    has_anonymous_profile_picture: boolean
    liked_clips_count: number
    fan_club_info: FanClubInfo
    fbid_v2: string
    transparency_product_enabled: boolean
    interop_messaging_user_fbid: string
    show_insights_terms: boolean
    allowed_commenter_type: string
    hd_profile_pic_url_info: HdProfilePicUrlInfo
    hd_profile_pic_versions: HdProfilePicVersion[]
    is_unpublished: boolean
    reel_auto_archive: string
    can_boost_post: boolean
    can_see_organic_insights: boolean
    has_onboarded_to_text_post_app: boolean
    pk: string
    pk_id: string
    username: string
    full_name: string
    is_private: boolean
    is_verified: boolean
    profile_pic_url: string
    account_badges: any[]
    feed_post_reshare_disabled: boolean
    show_account_transparency_details: boolean
    third_party_downloads_enabled: number
}

interface FanClubInfo {
    fan_club_id: any
    fan_club_name: any
    is_fan_club_referral_eligible: any
    fan_consideration_page_revamp_eligiblity: any
    is_fan_club_gifting_eligible: any
    subscriber_count: any
    connected_member_count: any
    autosave_to_exclusive_highlight: any
    has_enough_subscribers_for_ssc: any
}

interface HdProfilePicUrlInfo {
    url: string
    width: number
    height: number
}

interface HdProfilePicVersion {
    width: number
    height: number
    url: string
}

interface CommentInformTreatment {
    should_have_inform_treatment: boolean
    text: string
    url: any
    action_type: any
}

interface SharingFrictionInfo {
    should_have_sharing_friction: boolean
    bloks_app_url: any
    sharing_friction_payload: any
}

interface MediaCroppingInfo {
    square_crop: SquareCrop
}

interface SquareCrop {
    crop_left: number
    crop_right: number
    crop_top: number
    crop_bottom: number
}

interface User2 {
    has_anonymous_profile_picture: boolean
    liked_clips_count: number
    fan_club_info: FanClubInfo2
    fbid_v2: string
    transparency_product_enabled: boolean
    interop_messaging_user_fbid: string
    show_insights_terms: boolean
    allowed_commenter_type: string
    hd_profile_pic_url_info: HdProfilePicUrlInfo2
    hd_profile_pic_versions: HdProfilePicVersion2[]
    is_unpublished: boolean
    reel_auto_archive: string
    can_boost_post: boolean
    can_see_organic_insights: boolean
    has_onboarded_to_text_post_app: boolean
    pk: string
    pk_id: string
    username: string
    full_name: string
    is_private: boolean
    is_verified: boolean
    profile_pic_url: string
    account_badges: any[]
    feed_post_reshare_disabled: boolean
    show_account_transparency_details: boolean
    third_party_downloads_enabled: number
}

interface FanClubInfo2 {
    fan_club_id: any
    fan_club_name: any
    is_fan_club_referral_eligible: any
    fan_consideration_page_revamp_eligiblity: any
    is_fan_club_gifting_eligible: any
    subscriber_count: any
    connected_member_count: any
    autosave_to_exclusive_highlight: any
    has_enough_subscribers_for_ssc: any
}

interface HdProfilePicUrlInfo2 {
    url: string
    width: number
    height: number
}

interface HdProfilePicVersion2 {
    width: number
    height: number
    url: string
}

interface ImageVersions2 {
    candidates: Candidate[]
    additional_candidates: AdditionalCandidates
    smart_thumbnail_enabled: boolean
}

interface Candidate {
    width: number
    height: number
    url: string
}

interface AdditionalCandidates {
    igtv_first_frame: IgtvFirstFrame
    first_frame: FirstFrame
    smart_frame: any
}

interface IgtvFirstFrame {
    width: number
    height: number
    url: string
}

interface FirstFrame {
    width: number
    height: number
    url: string
}

interface VideoVersion {
    type: number
    width: number
    height: number
    url: string
    id: string
}

interface ClipsMetadata {
    music_info: any
    original_sound_info: OriginalSoundInfo
    audio_type: string
    music_canonical_id: string
    featured_label: any
    mashup_info: MashupInfo
    reusable_text_info: any
    reusable_text_attribute_string: any
    nux_info: any
    viewer_interaction_settings: any
    branded_content_tag_info: BrandedContentTagInfo
    shopping_info: any
    additional_audio_info: AdditionalAudioInfo
    is_shared_to_fb: boolean
    breaking_content_info: any
    challenge_info: any
    reels_on_the_rise_info: any
    breaking_creator_info: any
    asset_recommendation_info: any
    contextual_highlight_info: any
    clips_creation_entry_point: string
    audio_ranking_info: AudioRankingInfo
    template_info: any
    is_fan_club_promo_video: boolean
    disable_use_in_clips_client_cache: boolean
    content_appreciation_info: ContentAppreciationInfo
    achievements_info: AchievementsInfo
    show_achievements: boolean
    show_tips: any
    merchandising_pill_info: any
    is_public_chat_welcome_video: boolean
    professional_clips_upsell_type: number
    high_intent_follow_eligible: boolean
}

interface OriginalSoundInfo {
    audio_asset_id: string
    music_canonical_id: any
    progressive_download_url: string
    duration_in_ms: number
    dash_manifest: string
    ig_artist: IgArtist
    should_mute_audio: boolean
    hide_remixing: boolean
    original_media_id: string
    time_created: number
    original_audio_title: string
    consumption_info: ConsumptionInfo
    can_remix_be_shared_to_fb: boolean
    formatted_clips_media_count: any
    allow_creator_to_rename: boolean
    audio_parts: any[]
    is_explicit: boolean
    original_audio_subtype: string
    is_audio_automatically_attributed: boolean
    is_reuse_disabled: boolean
    is_xpost_from_fb: boolean
    xpost_fb_creator_info: any
    is_original_audio_download_eligible: boolean
    trend_rank: any
}

interface IgArtist {
    pk: string
    pk_id: string
    username: string
    full_name: string
    is_private: boolean
    is_verified: boolean
    profile_pic_url: string
    has_onboarded_to_text_post_app: boolean
}

interface ConsumptionInfo {
    is_bookmarked: boolean
    should_mute_audio_reason: string
    is_trending_in_clips: boolean
    should_mute_audio_reason_type: any
    display_media_id: any
}

interface MashupInfo {
    mashups_allowed: boolean
    can_toggle_mashups_allowed: boolean
    has_been_mashed_up: boolean
    is_light_weight_check: boolean
    formatted_mashups_count: any
    original_media: any
    privacy_filtered_mashups_media_count: any
    non_privacy_filtered_mashups_media_count: any
    mashup_type: any
    is_creator_requesting_mashup: boolean
    has_nonmimicable_additional_audio: boolean
    is_pivot_page_available: boolean
}

interface BrandedContentTagInfo {
    can_add_tag: boolean
}

interface AdditionalAudioInfo {
    additional_audio_username: any
    audio_reattribution_info: AudioReattributionInfo
}

interface AudioReattributionInfo {
    should_allow_restore: boolean
}

interface AudioRankingInfo {
    best_audio_cluster_id: string
}

interface ContentAppreciationInfo {
    enabled: boolean
    entry_point_container: any
}

interface AchievementsInfo {
    show_achievements: boolean
    num_earned_achievements: any
}
