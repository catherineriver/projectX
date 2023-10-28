import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import Container from '~/components/Container'
import { readToken } from '~/lib/sanity.api'
import { getClient } from '~/lib/sanity.client'
import {
  getPost, jsonBySlug,
  type Post,
  postSlugsQuery
} from '~/lib/sanity.queries'
import type { SharedPageProps } from '~/pages/_app'
import mapboxgl from 'mapbox-gl';
import Map from '~/components/Map'
import router from 'next/router'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API;

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
  console.log(props.post)

  return (
    <Container>
      <div className="map-page">
        <div className="map-button">
          <button className="with-border button" onClick={() => router.back()}>Назад</button>
        </div>

        <Map
          geoJsonData={props.post?.geoJson}
          placesData={props.post?.places}
          style={props.post?.map}
        />
        <div className="places-list">

        </div>
      </div>
    </Container>
  )
}

export const getStaticPaths = async () => {
  const client = getClient()
  const slugs = await client.fetch(postSlugsQuery)

  return {
    paths: slugs?.map(({ slug }) => `/post/map/${slug}`) || [],
    fallback: 'blocking',
  }
}
