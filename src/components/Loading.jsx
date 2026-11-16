import 'react'
import { LoadingOutlined } from '@ant-design/icons'

function LoadingFallback() {
  return (
    <>
      <div
        id="loadingFallback"
        className="fixed top-0 left-0 w-full h-full bg-white/50 flex justify-center items-center z-[99] transition-opacity duration-300 opacity-100"
      >
        <LoadingOutlined style={{ color: '#f6339a', fontSize: '6vh' }} />
      </div>
    </>
  )
}

export default LoadingFallback
