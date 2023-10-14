import { PortableText } from '@portabletext/react'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import Image from 'next/image'
import { useLiveQuery } from 'next-sanity/preview'

import Container from '~/components/Container'
import { readToken } from '~/lib/sanity.api'
import { getClient } from '~/lib/sanity.client'
import { urlForImage } from '~/lib/sanity.image'
import {
  getPost, jsonBySlug,
  type Post,
  postBySlugQuery,
  postSlugsQuery
} from '~/lib/sanity.queries'
import type { SharedPageProps } from '~/pages/_app'
import { formatDate } from '~/utils'
// @ts-ignore
import mapboxgl from '!mapbox-gl';
import { useEffect, useRef, useState } from 'react' // eslint-disable-line import/no-webpack-loader-syntax

mapboxgl.accessToken = 'pk.eyJ1IjoiaGFybmF1bHRjYXRoZXJpbmUiLCJhIjoiY2xua3FxNjlzMDl3bDJrcGI4dWQyaGtxcCJ9.uxPl-TQVWXAvDk9d1fnGUQ';

interface Query {
  [key: string]: string
}

export const getStaticProps: GetStaticProps<
  SharedPageProps & {
    post: Post
  },
  Query
> = async ({ draftMode = false, params = {} }) => {
  const client = getClient(draftMode ? { token: readToken } : undefined)
  const post = await getPost(client, params.slug)

  if (!post) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      draftMode,
      token: draftMode ? readToken : '',
      post,
    },
  }
}

export default function ProjectSlugRoute(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  const [post] = useLiveQuery(props.post, jsonBySlug, {
    slug: props.post.slug.current
  })

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-77);
  const [lat, setLat] = useState(38);
  const [zoom, setZoom] = useState(11.15);
  const geoJsonData = typeof post.geoJson === 'string' ? JSON.parse(post.geoJson) : post.geoJson;

  console.log(geoJsonData)


  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: post.map,
      center: [lng, lat],
      zoom: zoom
    });
  });

  return (
    <Container>
      <section className="post">
        <div className="post__container">
          <h1 className="post__title">{post.title}</h1>
          <p className="post__excerpt">{post.excerpt}</p>
          <p className="post__date">{formatDate(post._createdAt)}</p>
          <div className="post__content">
            <PortableText value={post.body} />
          </div>

          <div>
            <div ref={mapContainer} className="map-container" />
          </div>
        </div>
      </section>
    </Container>
  )
}

export const getStaticPaths = async () => {
  const client = getClient()
  const slugs = await client.fetch(postSlugsQuery)

  return {
    paths: slugs?.map(({ slug }) => `/post/${slug}`) || [],
    fallback: 'blocking',
  }
}
