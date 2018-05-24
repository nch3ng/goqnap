export interface ICourse {
  _id?: string;
  title: string;
  code_name: string;
  desc: string;
  keywords?: string;
  youtube_ref: string;
  category: string;
  watched?: number;
  rank?: number;
  createAt?: Date;
  publishedDate?: Date;
  like?: number;
  dislike?: number;
  favoriteCount?: number;
  duration?: string;
  commentCount?: number;
}
