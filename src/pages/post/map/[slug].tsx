import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import Container from '~/components/Container'
import { readToken } from '~/lib/sanity.api'
import { getClient } from '~/lib/sanity.client'
import {
  getPost,
  jsonBySlug,
  type Post,
  postSlugsQuery,
} from '~/lib/sanity.queries'
import type { SharedPageProps } from '~/pages/_app'
import mapboxgl from 'mapbox-gl'
import Map from '~/components/Map'
import router from 'next/router'
import { useEffect, useState } from 'react'
import { urlForImage } from '~/lib/sanity.image'
import Image from 'next/image'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API

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
  const [dataloaded, setLoading] = useState(false)
  const [pointsData, setPointsData] = useState([])
  const [flyToCoordinates, setFlyToCoordinates] = useState<
    [number, number] | null
  >(null)

  const handleFlyTo = (latitude: number, longitude: number) => {
    setFlyToCoordinates([longitude, latitude])
  }

  // async function fetchPointsData(refs, client) {
  //   const query = `*[_id in $refs]`
  //   const params = { refs }
  //   return await client.fetch(query, params)
  // }

  function fetchPointsData(refs, client) {
    const query = `*[_id in $refs]`
    const params = { refs }
    return client.fetch(query, params)
  }

  useEffect(() => {
    if (props.post && props.post.pointsCards) {
      const refs = props.post.pointsCards.map((point) => point._ref)
      fetchPointsData(refs, getClient())
        .then((data) => {
          setPointsData(data)
        })
        .finally(() => {
          setLoading(true)
        })
    }
  }, [props.post])

  return (
    <Container>
      <div className="map-page">
        <div className="map-button">
          <button className="with-border button" onClick={() => router.back()}>
            Назад
          </button>
        </div>
        {dataloaded ? (
          <Map
            geoJsonData={props.post?.geoJson}
            pointsData={pointsData}
            style={props.post?.map}
            flyToCoordinates={flyToCoordinates}
          />
        ) : (
          <div>Map data Loading...</div>
        )}
        <div className="places-list">
          <div className="places-list__holder">
            {pointsData &&
              pointsData.map((card: any, index: number) => (
                <div
                  key={index}
                  className="place"
                  onClick={() =>
                    handleFlyTo(
                      card.coordinates.latitude,
                      card.coordinates.longitude,
                    )
                  }
                >
                  <div className="place__header">
                    <Image
                      className="place__cover"
                      src={urlForImage(card.mainImage)
                        .width(30)
                        .height(30)
                        .url()}
                      height={30}
                      width={30}
                      alt=""
                    />
                    <div className="place__info">
                      <h3>{card.title}</h3>
                      {card.coordinates !== undefined && (
                        <>
                          {/* <div>{card.coordinates.latitude}</div> */}
                          {/* <div>{card.coordinates.longitude}</div> */}
                        </>
                      )}
                    </div>
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
