import type { PortableTextBlock } from '@portabletext/types'
import type { ImageAsset, Slug } from '@sanity/types'
import groq from 'groq'
import { type SanityClient } from 'next-sanity'

export const postsQuery = groq`*[_type == "post" && defined(slug.current)] | order(_createdAt desc)`

export async function getPosts(client: SanityClient): Promise<Post[]> {
  return await client.fetch(postsQuery)
}

export const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0]`
export const jsonBySlug = groq`
*[_type == "post" && slug.current == $slug][0]{
  ...,
  pointsCards[] -> {
    title,
    mainImage,
    body,
  }
}
`

export async function getPost(
  client: SanityClient,
  slug: string,
): Promise<Post> {
  return await client.fetch(postBySlugQuery, {
    slug,
  })
}

export const postSlugsQuery = groq`
*[_type == "post" && defined(slug.current)][].slug.current
`

export interface Post {
  _type: 'post'
  _id: string
  _createdAt: string
  title?: string
  slug: Slug
  excerpt?: string
  mainImage?: ImageAsset
  body: PortableTextBlock[]
  map?: string,
  places?: any[],
  geoJson?: string,
  points?: string,
  length?: string,
  time?: string,
  pointsCards: any[]
}

export interface Point {
  title: string;
  mainImage: {
    asset: {
      _id: string;
      url: string;
    }
  }
  body: PortableTextBlock[]
}

