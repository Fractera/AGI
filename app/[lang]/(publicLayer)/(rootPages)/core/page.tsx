import Page, { generateMetadata } from './_components'

// Тонкий маршрут — та же форма, что у главной.
export const revalidate = 300
export const dynamicParams = true

export { generateMetadata }
export default Page
