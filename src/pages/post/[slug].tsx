import { PortableText } from '@portabletext/react'
import mapboxgl from 'mapbox-gl'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useLiveQuery } from 'next-sanity/preview'
import { useEffect, useRef, useState } from 'react'

import Container from '~/components/Container'
import { readToken } from '~/lib/sanity.api'
import { getClient } from '~/lib/sanity.client'
import { urlForImage } from '~/lib/sanity.image'
import {
  getPost,
  jsonBySlug,
  type Post,
  postSlugsQuery,
} from '~/lib/sanity.queries'
import type { SharedPageProps } from '~/pages/_app'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API

interface Query {
  [key: string]: string
}

export const getStaticProps: GetStaticProps<
  SharedPageProps & { post: Post },
  Query
> = async ({ params }) => {
  const draftMode = process.env.NODE_ENV !== 'production'
  const client = getClient(draftMode ? { token: readToken } : undefined)
  const post = await getPost(client, params?.slug)

  if (!post) {
    return { notFound: true }
  }

  return {
    props: {
      draftMode,
      token: draftMode ? readToken : '',
      post,
    },
    revalidate: 1, // or an appropriate number in seconds
  }
}

export default function ProjectSlugRoute(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  const [post] = useLiveQuery(props.post, jsonBySlug, {
    slug: props.post.slug.current,
  })
  const [pointsData, setPointsData] = useState([])
  const [openedIndex, setOpenedIndex] = useState<number | null>(null)
  const [isBought, setIsBought] = useState<boolean>(false)

  const handleToggle = (index: number) => {
    setOpenedIndex(openedIndex === index ? null : index)
  }

  const handleBuy = () => {
    setIsBought(true)
  }

  async function fetchPointsData(refs, client) {
    const query = `*[_id in $refs]`
    const params = { refs }
    return await client.fetch(query, params)
  }

  useEffect(() => {
    if (post && post.pointsCards) {
      const refs = post.pointsCards.map((point) => point._ref)
      fetchPointsData(refs, getClient()).then((data) => {
        setPointsData(data)
      })
    }
  }, [post])

  return (
    <Container>
      <section className="post">
        <div className="post__container">
          <div className="post__content">
            <h1 className="post__title">{post.title}</h1>
            <div className="post__meta">
              <div className="post__meta-item with-border">
                <span>{post.points}</span>
                точек
              </div>
              <div className="post__meta-item with-border">
                <span>{post.time} ч</span>
                время
              </div>
              <div className="post__meta-item with-border">
                <span>~{post.length} км</span>
                расстояние
              </div>
            </div>
            <div className="buttons-holder">
              {isBought ? (
                <Link
                  className="with-border button"
                  href={`/post/map/${post.slug.current}`}
                >
                  открыть карту
                </Link>
              ) : (
                <button
                  className="with-border button"
                  onClick={() => handleBuy()}
                >
                  Купить
                </button>
              )}
            </div>
            <div>
              <div>
                <div className="post__text">
                  <PortableText value={post.body} />
                </div>
              </div>
              {isBought && (
                <div>
                  <div className="post__places">
                    {pointsData &&
                      pointsData.map((card: any, index: number) => (
                        <div key={index} className="place with-border">
                          <div
                            className="place__card"
                            onClick={() => handleToggle(index)}
                          >
                            <Image
                              className="place__cover"
                              src={urlForImage(post.mainImage)
                                .width(50)
                                .height(50)
                                .url()}
                              height={50}
                              width={50}
                              alt=""
                            />
                            <h3>{card.title}</h3>
                          </div>

                          {openedIndex === index && (
                            <div>
                              <PortableText value={card.body} />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
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
    paths: slugs?.map((slug) => ({ params: { slug } })) || [],
    fallback: 'blocking',
  }
}
