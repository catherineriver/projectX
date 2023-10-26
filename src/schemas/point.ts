import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'pointCard',
  title: 'Point Card',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    })
  ],
});
