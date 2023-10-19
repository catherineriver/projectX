import { SchemaTypeDefinition } from 'sanity'

import blockContent from './blockContent'
import post from './post'
import card from '~/schemas/card'

export const schemaTypes = [post, blockContent, card]
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [post, blockContent, card],
}
