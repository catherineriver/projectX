import Image from 'next/image'

import { urlForImage } from '~/lib/sanity.image'
import { type Post } from '~/lib/sanity.queries'
import { formatDate } from '~/utils'

export default function Card({ post }: { post: Post }) {
  return (
    <div className="card">
      {post.mainImage ? (
        <Image
          className="card__cover"
          src={urlForImage(post.mainImage).width(500).height(150).url()}
          height={150}
          width={500}
          layout="responsive"
          alt=""
        />
      ) : (
        <div className="card__cover--none" />
      )}
      <div className="card__container">
        <h3 className="card__title">
          <a className="card__link" href={`/post/${post.slug.current}`}>
            {post.title}
          </a>
        </h3>
        <div className="card__meta">
          <div className="card__excerpt">{post.time} h</div>
          <div className="card__excerpt">{post.points} places</div>
          <div className="card__excerpt">{post.length} km</div>
        </div>
      </div>
    </div>
  )
}
