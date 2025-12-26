// 导入本地图片
import image01 from '@/assets/image01.png'
import image02 from '@/assets/image02.png'
import image03 from '@/assets/image03.png'
import image04 from '@/assets/image04.png'
import image05 from '@/assets/image05.png'
import image06 from '@/assets/image06.png'
import image07 from '@/assets/image07.png'
import image08 from '@/assets/image08.png'
import image09 from '@/assets/image09.png'
import image10 from '@/assets/image10.png'
import image11 from '@/assets/image11.png'
import image12 from '@/assets/image12.png'
import image13 from '@/assets/image13.png'
import image14 from '@/assets/image14.png'
import image15 from '@/assets/image15.png'
import image16 from '@/assets/image16.png'
import image17 from '@/assets/image17.png'
import image18 from '@/assets/image18.png'
import image19 from '@/assets/image19.png'
import image20 from '@/assets/image20.png'
import image21 from '@/assets/image21.png'
import image22 from '@/assets/image22.png'
import image23 from '@/assets/image23.png'
import image24 from '@/assets/image24.png'

export const properties = [
  {
    id: 1,
    title: '现代简约公寓',
    description: '位于市中心的现代简约公寓，装修时尚，设施齐全，交通便利。步行可达地铁站和多个购物中心，是商务出行和休闲旅游的理想选择。',
    price: 388,
    rating: 4.8,
    reviews: 126,
    location: '上海市浦东新区',
    images: [
      image01,
      image02,
      image03,
      image04
    ],
    host: {
      name: '张房东',
      avatar: 'https://picsum.photos/id/1011/100/100',
      verified: true,
      joined: '2020年'
    },
    amenities: ['Wi-Fi', '空调', '洗衣机', '冰箱', '电视', '厨房', '卫生间', '暖气'],
    bedroom: 2,
    bathroom: 1,
    guests: 4,
    beds: 2,
    checkIn: '15:00',
    checkOut: '11:00',
    rules: ['禁止吸烟', '禁止携带宠物', '允许举办派对']
  },
  {
    id: 2,
    title: '中式古典套房',
    description: '体验传统中式古典风格，家具典雅，环境静谧。位于文化街区附近，方便游览历史景点，是感受中华文化底蕴的绝佳住宿。',
    price: 568,
    rating: 4.9,
    reviews: 89,
    location: '北京市东城区',
    images: [
      image05,
      image06,
      image07,
      image08
    ],
    host: {
      name: '李房东',
      avatar: 'https://picsum.photos/id/1012/100/100',
      verified: true,
      joined: '2018年'
    },
    amenities: ['Wi-Fi', '空调', '洗衣机', '冰箱', '电视', '厨房', '卫生间', '暖气', '茶室'],
    bedroom: 3,
    bathroom: 2,
    guests: 6,
    beds: 3,
    checkIn: '14:00',
    checkOut: '12:00',
    rules: ['禁止吸烟', '保持安静', '尊重传统家具']
  },
  {
    id: 3,
    title: '日式和风民宿',
    description: '纯正日式装修风格，榻榻米设计，庭院景观。提供日式早餐服务，让您在异国他乡感受家的温馨。',
    price: 888,
    rating: 4.7,
    reviews: 156,
    location: '广州市天河区',
    images: [
      image13,
      image14,
      image15,
      image16
    ],
    host: {
      name: '王房东',
      avatar: 'https://picsum.photos/id/1013/100/100',
      verified: true,
      joined: '2019年'
    },
    amenities: ['Wi-Fi', '空调', '厨房', '卫生间', '浴缸', '庭院', '早餐服务'],
    bedroom: 1,
    bathroom: 1,
    guests: 2,
    beds: 1,
    checkIn: '16:00',
    checkOut: '10:00',
    rules: ['脱鞋入室', '禁止吸烟', '保持整洁']
  },
  {
    id: 4,
    title: '地中海风情屋',
    description: '蓝白色调的地中海风格，面朝大海，春暖花开。拥有独立阳台，可欣赏绝美海景，是度假放松的理想之选。',
    price: 458,
    rating: 4.6,
    reviews: 98,
    location: '厦门市思明区',
    images: [
      image09,
      image10,
      image11,
      image12
    ],
    host: {
      name: '赵房东',
      avatar: 'https://picsum.photos/id/1014/100/100',
      verified: true,
      joined: '2021年'
    },
    amenities: ['Wi-Fi', '空调', '洗衣机', '冰箱', '电视', '厨房', '卫生间', '阳台', '海景'],
    bedroom: 1,
    bathroom: 1,
    guests: 3,
    beds: 2,
    checkIn: '15:00',
    checkOut: '11:00',
    rules: ['禁止吸烟', '禁止携带宠物', '注意阳台安全']
  },
  {
    id: 5,
    title: '北欧风格两居室',
    description: '位于城市新区的北欧风格两居室，装修简洁明亮，充满北欧风情。房间宽敞舒适，周边配套设施完善，适合家庭居住。',
    price: 398,
    rating: 4.8,
    reviews: 112,
    location: '杭州市西湖区',
    images: [
      image17,
      image18,
      image19,
      image20
    ],
    host: {
      name: '陈房东',
      avatar: 'https://picsum.photos/id/1013/100/100',
      verified: true,
      joined: '2019年'
    },
    amenities: ['Wi-Fi', '空调', '洗衣机', '冰箱', '电视', '厨房', '卫生间', '暖气', '停车位', '电梯'],
    bedroom: 2,
    bathroom: 1,
    guests: 4,
    beds: 2,
    checkIn: '15:00',
    checkOut: '11:00',
    rules: ['禁止吸烟', '禁止携带宠物', '安静时间：22:00-08:00']
  },
  {
    id: 6,
    title: '法式浪漫别墅',
    description: '位于城市郊区的法式浪漫别墅，环境优雅，装修精致，充满法国浪漫风情。拥有独立花园和泳池，适合度假休闲或举办私人聚会。',
    price: 1288,
    rating: 4.9,
    reviews: 67,
    location: '成都市武侯区',
    images: [
      image21,
      image22,
      image23,
      image24
    ],
    host: {
      name: '杨房东',
      avatar: 'https://picsum.photos/id/1014/100/100',
      verified: true,
      joined: '2017年'
    },
    amenities: ['Wi-Fi', '空调', '厨房', '卫生间', '泳池', '花园', '停车位', '壁炉', '影音室'],
    bedroom: 4,
    bathroom: 3,
    guests: 8,
    beds: 4,
    checkIn: '14:00',
    checkOut: '12:00',
    rules: ['禁止吸烟', '禁止携带宠物', '安静时间：22:00-08:00', '不允许举办派对']
  }
];

export const reviews = [
  {
    id: 1,
    propertyId: 1,
    user: {
      name: '刘先生',
      avatar: 'https://picsum.photos/id/1001/100/100'
    },
    rating: 5,
    comment: '非常满意的住宿体验！房间干净整洁，设施齐全，交通便利。房东热情周到，强烈推荐！',
    date: '2024-01-15'
  },
  {
    id: 2,
    propertyId: 1,
    user: {
      name: '王女士',
      avatar: 'https://picsum.photos/id/1002/100/100'
    },
    rating: 4,
    comment: '房间不错，地理位置很好，就是隔音稍微差了一些。整体满意，下次还会选择。',
    date: '2024-01-10'
  },
  {
    id: 3,
    propertyId: 2,
    user: {
      name: '张先生',
      avatar: 'https://picsum.photos/id/1003/100/100'
    },
    rating: 5,
    comment: '古典风格很有特色，家具都很精致。房东提供的茶室很棒，非常享受！',
    date: '2024-01-08'
  },
  {
    id: 4,
    propertyId: 3,
    user: {
      name: '李女士',
      avatar: 'https://picsum.photos/id/1004/100/100'
    },
    rating: 5,
    comment: '日式风格太棒了！榻榻米很舒适，早餐也很美味。是一次难忘的住宿体验。',
    date: '2024-01-05'
  },
  {
    id: 5,
    propertyId: 4,
    user: {
      name: '赵先生',
      avatar: 'https://picsum.photos/id/1005/100/100'
    },
    rating: 4,
    comment: '海景非常美，早晨在阳台上看日出是一种享受。设施都很新，居住舒适。',
    date: '2024-01-02'
  }
];

export const searchProperties = (keyword) => {
  if (!keyword) return properties;
  const lowerKeyword = keyword.toLowerCase();
  return properties.filter(p => 
    p.title.toLowerCase().includes(lowerKeyword) ||
    p.location.toLowerCase().includes(lowerKeyword) ||
    p.description.toLowerCase().includes(lowerKeyword)
  );
};

export const getPropertyById = (id) => {
  return properties.find(p => p.id === id);
};

export const getReviewsByPropertyId = (propertyId) => {
  return reviews.filter(r => r.propertyId === propertyId);
};
