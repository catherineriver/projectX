import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import Container from '~/components/Container'
import { readToken } from '~/lib/sanity.api'
import { getClient } from '~/lib/sanity.client'
import { PortableText } from '@portabletext/react'
import {
  getPost, jsonBySlug,
  type Post,
  postSlugsQuery
} from '~/lib/sanity.queries'
import type { SharedPageProps } from '~/pages/_app'
import mapboxgl from 'mapbox-gl';
import Map from '~/components/Map'
import router from 'next/router'
import { useEffect, useState } from 'react'
import { urlForImage } from '~/lib/sanity.image'
import Image from 'next/image'

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
  const [pointsData, setPointsData] = useState([]);

  async function fetchPointsData(refs, client) {
    const query = `*[_id in $refs]`;
    const params = { refs };
    return await client.fetch(query, params);
  }

  console.log(pointsData)
  useEffect(() => {
    if (props.post && props.post.pointsCards) {
      const refs = props.post.pointsCards.map(point => point._ref);
      fetchPointsData(refs, getClient()).then(data => {
        setPointsData(data);
      });
    }
  }, []);

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
          <div className="places-list__holder">
            {pointsData && pointsData.map((card: any, index: number) => (
              <div key={index} className="place">
                <h3>{card.title}</h3>
                <Image
                  className="place__cover"
                  src={urlForImage(card.mainImage).width(50).height(50).url()}
                  height={50}
                  width={50}
                  alt=""
                />
                <div className="place__description">
                  <PortableText value={card.description} />
                </div>
              </div>
            ))}
          </div>
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
