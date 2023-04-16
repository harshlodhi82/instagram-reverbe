export interface ISearchMusicResponse {
    items: Item[]
    page_info: PageInfo
    alacorn_session_id: string
    music_reels: any
    dark_banner_message: any
    inform_module: any
    status: string
}

interface Item {
    track: Track
    metadata: Metadata
}

interface Track {
    audio_cluster_id: string
    id: string
    title: string
    sanitized_title: any
    subtitle: string
    display_artist: string
    artist_id: any
    cover_artwork_uri: string
    cover_artwork_thumbnail_uri: string
    progressive_download_url: string
    fast_start_progressive_download_url: string
    web_30s_preview_download_url: any
    reactive_audio_download_url: any
    highlight_start_times_in_ms: number[]
    is_explicit: boolean
    dash_manifest: any
    has_lyrics: boolean
    audio_asset_id: string
    duration_in_ms: number
    dark_message: any
    allows_saving: boolean
    territory_validity_periods: TerritoryValidityPeriods
    ig_username: any
}

interface TerritoryValidityPeriods { }

interface Metadata {
    is_bookmarked: boolean
    allow_media_creation_with_music: boolean
    is_trending_in_clips: boolean
    trend_rank: any
    formatted_clips_media_count: string
    display_labels: any
    display_media_id: any
}

interface PageInfo {
    next_max_id: string
    more_available: boolean
}
