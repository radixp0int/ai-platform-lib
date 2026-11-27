/**
 * Where a page's data stands. `loading` draws the page's skeleton; `unavailable`
 * says the data could not be loaded and offers a retry. An empty list is not a
 * state of its own: pass no rows.
 */
export type RecipeState = 'ready' | 'loading' | 'unavailable'
