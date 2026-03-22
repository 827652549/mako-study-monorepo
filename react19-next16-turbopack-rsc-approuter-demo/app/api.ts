export async function getComments(unionKey:string): Promise<string> {
  const r = await new Promise((r) => {
    setTimeout(() => {
      r("一些评论XXX"+unionKey)
    }, 2000 * Math.random())
  })
  return r as string
}