export class AsyncQueue<T> implements AsyncIterable<T> {
  private queue: T[] = []
  private resolvers: ((value: T) => void)[] = []
  private maxSize: number

  constructor(maxSize = Infinity) {
    this.maxSize = maxSize
  }

  push(item: T) {
    const resolve = this.resolvers.shift()
    if (resolve) resolve(item)
    else {
      if (this.queue.length >= this.maxSize && this.maxSize !== Infinity) {
        this.queue.shift()
      }
      this.queue.push(item)
    }
  }

  async next(): Promise<T> {
    if (this.queue.length > 0) return this.queue.shift()!
    return new Promise((resolve) => this.resolvers.push(resolve))
  }

  async *[Symbol.asyncIterator]() {
    while (true) yield await this.next()
  }
}
