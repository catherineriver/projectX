import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'points',
      title: 'Points',
      type: 'string',
    }),
    defineField({
      name: 'length',
      title: 'Length',
      type: 'string',
    }),
    defineField({
      name: 'time',
      title: 'Time',
      type: 'string',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
    defineField({
      name: 'map',
      title: 'Map',
      type: 'text',
    }),
    defineField({
      name: 'geoJson',
      title: 'Geo Json',
      type: 'text',
    }),
    defineField({
      name: 'pointsCards',
      title: 'Points Cards',
      type: 'array',
      of: [
        {
          title: 'Card',
          name: 'card',
          type: 'reference',
          to: [{ type: 'card' }]
        }
      ]
    })
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const { author } = selection
      return { ...selection, subtitle: author && `by ${author}` }
    },
  },
})
