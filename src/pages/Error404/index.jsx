import Header from 'components/Header'
import { Link } from '@tanstack/react-router'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'

function Error404() {
  return (
    <>
      <Header />
      <div className="w-full h-[calc(100vh-75px)] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="text-[50px] font-extrabold text-[#333] flex items-center justify-center mb-3" id="title">
            4 <SentimentVeryDissatisfiedIcon sx={{ fontSize: 50, margin: '0 2px' }} /> 4
          </div>

          <div className="desc">
            <p className="text-textFontSizes text-[#333] mb-6">
              抱歉， 我們找不到符合您搜尋條件的頁面。在此期間您可以：
            </p>
          </div>
          <div className="inline-block text-textFontSizes rounded-[1vh] bg-primary-burnt-orange transition-all duration-300 cursor-pointer mt-3 px-3">
            <Link to="/" className="font-bold block p-3 h-full no-underline text-white">
              返回首頁
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Error404
