import Page, { generateMetadata } from './_components'

// Тонкий маршрут — та же форма, что у страницы AGI.
export const revalidate = 300
export const dynamicParams = true

export { generateMetadata }
export default Page
