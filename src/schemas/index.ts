import { SchemaTypeDefinition } from 'sanity'

import blockContent from './blockContent'
import post from './post'
import point from '~/schemas/point'

export const schemaTypes = [post, blockContent, point]
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [post, blockContent, point],
}
