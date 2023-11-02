import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'pointCard',
  title: 'Point Card',
  type: 'document',
  fields: [
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'coordinates',
      title: 'Coordinates',
      description: 'Point coordinates on google map',
      type: 'object',
      fields: [
        {name: 'longitude', title: 'Longitude', type: 'number'},
        {name: 'latitude', title: 'Latitude', type: 'number'},
      ]
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
  ],
});
