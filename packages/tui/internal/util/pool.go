package util

import (
	"strings"
	"sync"
)

const pooledByteCap = 32 * 1024

var builderPool = sync.Pool{
	New: func() any {
		var b strings.Builder
		return &b
	},
}

var bytePool = sync.Pool{
	New: func() any {
		return make([]byte, 0, pooledByteCap)
	},
}

func GetBuilder() *strings.Builder {
	return builderPool.Get().(*strings.Builder)
}

func PutBuilder(b *strings.Builder) {
	if b == nil {
		return
	}
	b.Reset()
	b.Grow(0)
	builderPool.Put(b)
}

func GetByteSlice() []byte {
	buf := bytePool.Get().([]byte)
	return buf[:0]
}

func PutByteSlice(buf []byte) {
	if buf == nil {
		return
	}
	if cap(buf) != pooledByteCap {
		return
	}
	bytePool.Put(buf[:0])
}
