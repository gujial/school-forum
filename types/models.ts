// ===== 核心数据模型 =====

/**
 * 用户相关类型
 */
export interface User {
    user_id: number;
    username: string;
    email?: string;
    created_at?: string;
    admin?: boolean;
}

export interface AuthUser extends User {
    admin: boolean;
}

/**
 * 推文相关类型
 */
export interface Tweet {
    tweet_id: number;
    user_id: number;
    content: string;
    created_at?: string;
    updated_at?: string;
    parent_id?: number;
    parent_tweet?: Tweet;
    tags: string[];
}

export interface TweetWithUser extends Tweet {
    user?: User;
}

/**
 * 评论相关类型
 */
export interface Comment {
    comment_id: number;
    tweet_id: number;
    user_id: number;
    content: string;
    created_at?: string;
    parent_id?: number;
    replies?: Comment[];
    username?: string;
    avatar?: string;
}

export interface CommentWithUser extends Comment {
    username?: string;
    avatar?: string;
}

/**
 * 媒体相关类型
 */
export interface Media {
    media_id: number;
    tweet_id: number;
    media_url: string;
    media_type: 'image' | 'video' | 'all';
    created_at?: string;
}

/**
 * 社交互动相关类型
 */
export interface Follow {
    follower_id: number;
    following_id: number;
    created_at?: string;
}

export interface Like {
    user_id: number;
    tweet_id: number;
    created_at?: string;
}

/**
 * 消息相关类型
 */
export interface Message {
    comment_id: any;
    tweet_id: any;
    message_id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    created_at?: string;
    is_read?: boolean;
}

/**
 * 举报相关类型
 */
export interface Report {
    user_id?: number;
    report_id: number;
    tweet_id?: number;
    comment_id?: number;
    content: string;
    created_at?: string;
}

/**
 * 管理员相关类型
 */
export interface Admin {
    admin_id: number;
    user_id: number;
    created_at?: string;
}

// ===== API 响应类型 =====

/**
 * 通用API响应基础接口
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
}

/**
 * 用户相关API响应
 */
export interface UserApiResponse {
    success: boolean;
    message?: string;
    user?: User;
}

export interface UserListResponse extends ApiResponse<User[]> {
    maxPages: number;
}

export interface AuthApiResponse {
    success: boolean;
    message?: string;
    user?: AuthUser;
}

/**
 * 推文相关API响应
 */
export interface TweetApiResponse {
    success: boolean;
    message?: string;
    data?: Tweet;
}

export interface TweetListApiResponse {
    success: boolean;
    message?: string;
    data: Tweet[];
    maxPages: number;
}

/**
 * 评论相关API响应
 */
export interface CommentResponse extends ApiResponse<Comment> {}

export interface CommentListResponse extends ApiResponse<Comment[]> {}

export interface CommentWithUserResponse extends ApiResponse<CommentWithUser> {}

/**
 * 媒体相关API响应
 */
export interface MediaApiResponse {
    success: boolean;
    message?: string;
    data?: Media[];
}

export interface MediaUploadResponse
    extends ApiResponse<{
        media_id: number;
        media_url: string;
    }> {}

/**
 * 社交互动相关API响应
 */
export interface FollowResponse extends ApiResponse<boolean> {}

export interface FollowListResponse
    extends ApiResponse<{
        data: User[];
        total: number;
    }> {}

export interface LikeCheckResponse {
    success: boolean;
    message?: string;
    like?: boolean;
}

export interface LikeCountResponse {
    success: boolean;
    message?: string;
    count?: number;
}

/**
 * 计数相关API响应
 */
export interface CommentCountResponse {
    success: boolean;
    message?: string;
    count?: number;
}

export interface ShareCountResponse {
    success: boolean;
    message?: string;
    count?: number;
}

/**
 * 消息相关API响应
 */
export interface MessageResponse extends PaginatedResponse<Message> {}

export interface MessageListResponse extends ApiResponse<Message[]> {}

/**
 * 举报相关API响应
 */
export interface ReportResponse extends ApiResponse<Report> {}

export interface ReportListResponse extends PaginatedResponse<Report> {}

/**
 * 文件相关API响应
 */
export interface AvatarApiResponse {
    success: boolean;
    message?: string;
    data?: string;
}

export interface BackgroundApiResponse {
    success: boolean;
    message?: string;
    data?: string;
}

// ===== 分页相关类型 =====
export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    maxPages: number;
}

// ===== 表单相关类型 =====

/**
 * 用户表单类型
 */
export interface UserForm {
    username?: string;
    email?: string;
    password?: string;
    oldPassword?: string;
    newPassword?: string;
}

/**
 * 推文表单类型
 */
export interface TweetForm {
    content: string;
    parent_id?: number;
    tags?: string[];
}

/**
 * 评论表单类型
 */
export interface CommentForm {
    content: string;
    tweet_id: number;
    parent_id?: number;
}

/**
 * 消息表单类型
 */
export interface MessageForm {
    content: string;
    receiver_id: number;
}

/**
 * 举报表单类型
 */
export interface ReportForm {
    target_type: 'tweet' | 'comment';
    target_id: number;
    reason: string;
}

// ===== 组件Props类型 =====

/**
 * TweetCard组件Props
 */
export interface TweetCardProps {
    tweet: Tweet;
    height?: string;
    maxHeight?: string;
}

/**
 * Avatar组件Props
 */
export interface AvatarProps {
    user: User;
    size?: number;
    clickable?: boolean;
}

/**
 * CommentArea组件Props
 */
export interface CommentAreaProps {
    tweetId: number;
    currentUser?: AuthUser;
}

// ===== 状态管理类型 =====

/**
 * 应用全局状态
 */
export interface AppState {
    user: AuthUser | null;
    error: string | null;
    success: string | null;
    loading: boolean;
}

/**
 * 推文状态管理
 */
export interface TweetState {
    tweets: Tweet[];
    currentTweet: Tweet | null;
    loading: boolean;
    error: string | null;
}

/**
 * 评论状态管理
 */
export interface CommentState {
    comments: Comment[];
    loading: boolean;
    error: string | null;
}

// ===== 工具类型 =====

/**
 * 将指定字段设为可选
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 将指定字段设为必需
 */
export type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

// ===== 枚举类型 =====

/**
 * 媒体类型枚举
 */
export enum MediaType {
    _IMAGE = 'image',
    _VIDEO = 'video',
    _ALL = 'all',
}

/**
 * 举报状态枚举
 */
export enum ReportStatus {
    _PENDING = 'pending',
    _RESOLVED = 'resolved',
    _REJECTED = 'rejected',
}

/**
 * 举报目标类型枚举
 */
export enum ReportTargetType {
    _TWEET = 'tweet',
    _COMMENT = 'comment',
}

/**
 * 用户角色枚举
 */
export enum UserRole {
    _USER = 'user',
    _ADMIN = 'admin',
}

// ===== 常量定义 =====

/**
 * 分页相关常量
 */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * 文件上传相关常量
 */
export const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

// ===== 类型守卫 =====

/**
 * 检查对象是否为User类型
 */
export function isUser(obj: any): obj is User {
    return obj && typeof obj.user_id === 'number' && typeof obj.username === 'string';
}

/**
 * 检查对象是否为Tweet类型
 */
export function isTweet(obj: any): obj is Tweet {
    return obj && typeof obj.tweet_id === 'number' && typeof obj.content === 'string';
}

/**
 * 检查对象是否为Comment类型
 */
export function isComment(obj: any): obj is Comment {
    return obj && typeof obj.comment_id === 'number' && typeof obj.content === 'string';
}

/**
 * 检查对象是否为Media类型
 */
export function isMedia(obj: any): obj is Media {
    return obj && typeof obj.media_id === 'number' && typeof obj.media_url === 'string';
}

/**
 * 检查对象是否为ApiResponse类型
 */
export function isApiResponse(obj: any): obj is ApiResponse {
    return obj && typeof obj.success === 'boolean';
}
