import { PortableText } from '@portabletext/react'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import { useLiveQuery } from 'next-sanity/preview'
import Container from '~/components/Container'
import { readToken } from '~/lib/sanity.api'
import { getClient } from '~/lib/sanity.client'
import {
  getPost, jsonBySlug,
  type Post,
  postSlugsQuery
} from '~/lib/sanity.queries'
import type { SharedPageProps } from '~/pages/_app'
import { formatDate } from '~/utils'
import mapboxgl from 'mapbox-gl';
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
  const [lng, setLng] = useState(-87);
  const [lat, setLat] = useState(41);
  const [zoom, setZoom] = useState(11.15);
  const geoJsonData = post ? JSON.parse(post.geoJson) : null;

  console.log(geoJsonData)

  useEffect(() => {
    if (!geoJsonData || map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: post.map,
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on('load', () => {
      map.current.addSource('line', {
        type: 'geojson',
        data: geoJsonData
      });

// add a line layer without line-dasharray defined to fill the gaps in the dashed line
      map.current.addLayer({
        type: 'line',
        source: 'line',
        id: 'line-background',
        paint: {
          'line-color': 'yellow',
          'line-width': 6,
          'line-opacity': 0.4
        }
      });

// add a line layer with line-dasharray set to the first value in dashArraySequence
      map.current.addLayer({
        type: 'line',
        source: 'line',
        id: 'line-dashed',
        paint: {
          'line-color': 'yellow',
          'line-width': 6,
          'line-dasharray': [0, 4, 3]
        }
      });

// technique based on https://jsfiddle.net/2mws8y3q/
// an array of valid line-dasharray values, specifying the lengths of the alternating dashes and gaps that form the dash pattern
      const dashArraySequence = [
        [0, 4, 3],
        [0.5, 4, 2.5],
        [1, 4, 2],
        [1.5, 4, 1.5],
        [2, 4, 1],
        [2.5, 4, 0.5],
        [3, 4, 0],
        [0, 0.5, 3, 3.5],
        [0, 1, 3, 3],
        [0, 1.5, 3, 2.5],
        [0, 2, 3, 2],
        [0, 2.5, 3, 1.5],
        [0, 3, 3, 1],
        [0, 3.5, 3, 0.5]
      ];

      let step = 0;

      function animateDashArray(timestamp) {
// Update line-dasharray using the next value in dashArraySequence. The
// divisor in the expression `timestamp / 50` controls the animation speed.
        const newStep = parseInt(
          String((timestamp / 50) % dashArraySequence.length)
        );

        if (newStep !== step) {
          map.current.setPaintProperty(
            'line-dashed',
            'line-dasharray',
            dashArraySequence[step]
          );
          step = newStep;
        }

// Request the next frame of the animation.
        requestAnimationFrame(animateDashArray);
      }

// start the animation
      animateDashArray(0);
    });
  }, [geoJsonData, lat, lng, zoom]);

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
