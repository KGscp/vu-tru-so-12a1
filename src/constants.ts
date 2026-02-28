import { Planet, SimulationObject, Environment } from './types';

export const PLANETS: Planet[] = [
  {
    id: 'sun',
    name: 'Mặt Trời',
    tagline: 'Trái tim của Hệ Mặt Trời',
    description: 'Ngôi sao ở trung tâm Hệ Mặt Trời, chiếm 99.8% khối lượng của cả hệ. Nó cung cấp năng lượng cho sự sống trên Trái Đất.',
    distance: '0 km (Trung tâm)',
    orbit: '230 triệu năm (Quanh Ngân Hà)',
    gravity: '274 m/s²',
    temperature: '5,500°C',
    image: 'https://phunuvietnam.mediacdn.vn/thumb_w/860/179072216278405120/2023/3/13/1073px-thesunbytheatmosphericimagingassemblyofnasa27ssolardynamicsobservatory-20100819-16786737277851506111205.jpg',
    color: '#f97316',
    order: 'Trung tâm',
    details: {
      overview: 'Mặt Trời là một quả cầu plasma khổng lồ, nóng rực. Phản ứng nhiệt hạch tại lõi của nó giải phóng năng lượng khổng lồ dưới dạng ánh sáng và nhiệt.',
      structure: 'Gồm lõi, vùng bức xạ, vùng đối lưu, quang cầu, sắc cầu và vành nhật hoa. Lõi có nhiệt độ lên tới 15 triệu độ C.',
      surface: 'Bề mặt (quang cầu) có các vết đen mặt trời và các tai lửa khổng lồ phun trào vào không gian.'
    }
  },
  {
    id: 'mercury',
    name: 'Sao Thủy',
    tagline: 'Hành tinh nhỏ nhất',
    description: 'Hành tinh gần Mặt Trời nhất và nhỏ nhất trong Hệ Mặt Trời. Nó không có bầu khí quyển để giữ nhiệt.',
    distance: '57.9M km',
    orbit: '88 ngày',
    gravity: '3.7 m/s²',
    temperature: '167°C',
    image: 'https://space-facts.com/wp-content/uploads/mercury.png',
    color: '#94a3b8',
    order: 'Hành tinh thứ 1',
    details: {
      overview: 'Sao Thủy là hành tinh đá nhỏ nhất, bề mặt đầy hố va chạm giống như Mặt Trăng. Nó quay rất chậm nhưng di chuyển trên quỹ đạo rất nhanh.',
      structure: 'Có lõi sắt khổng lồ chiếm khoảng 85% bán kính hành tinh, bao phủ bởi lớp manti đá và vỏ mỏng.',
      surface: 'Bề mặt chịu sự chênh lệch nhiệt độ cực lớn giữa ngày và đêm, từ -173°C đến 427°C.'
    }
  },
  {
    id: 'venus',
    name: 'Sao Kim',
    tagline: 'Hành tinh nóng nhất',
    description: 'Hành tinh thứ hai từ Mặt Trời. Nó có bầu khí quyển dày đặc giữ nhiệt, khiến nó nóng hơn cả Sao Thủy.',
    distance: '108.2M km',
    orbit: '224.7 ngày',
    gravity: '8.87 m/s²',
    temperature: '464°C',
    image: 'https://space-facts.com/wp-content/uploads/venus.png',
    color: '#fbbf24',
    order: 'Hành tinh thứ 2',
    details: {
      overview: 'Sao Kim thường được gọi là "hành tinh chị em" với Trái Đất do kích thước tương đồng, nhưng môi trường cực kỳ khắc nghiệt với áp suất cao.',
      structure: 'Cấu tạo gồm lõi sắt, manti đá và vỏ silicat. Bầu khí quyển chủ yếu là CO2 với những đám mây axit sulfuric.',
      surface: 'Bề mặt đầy núi lửa và các đồng bằng nham thạch rộng lớn, bị che phủ bởi lớp mây dày đặc.'
    }
  },
  {
    id: 'earth',
    name: 'Trái Đất',
    tagline: 'Hành tinh xanh',
    description: 'Hành tinh thứ ba tính từ Mặt Trời và là thiên thể duy nhất được biết đến hiện nay có sự sống. Bề mặt Trái Đất chủ yếu là nước, tạo nên màu xanh đặc trưng khi nhìn từ vũ trụ.',
    distance: '149.6M km',
    orbit: '365.25 ngày',
    gravity: '9.807 m/s²',
    temperature: '15°C',
    image: 'https://space-facts.com/wp-content/uploads/earth.png',
    color: '#13c8ec',
    order: 'Hành tinh thứ 3',
    details: {
      overview: 'Trái Đất là hành tinh duy nhất được biết đến có sự sống. Với 71% bề mặt là nước, nó được gọi là "Hành tinh xanh". Bầu khí quyển giàu oxy và nitơ bảo vệ chúng ta khỏi bức xạ mặt trời.',
      structure: 'Trái Đất có cấu trúc phân lớp: lớp vỏ đá mỏng bên ngoài, lớp manti dày đặc và lõi sắt-niken nóng chảy. Lõi trong cùng là chất rắn do áp suất cực lớn.',
      surface: 'Bề mặt Trái Đất rất đa dạng với núi cao, vực sâu, đại dương bao la và các mảng kiến tạo không ngừng di chuyển, tạo nên các trận động đất và núi lửa.'
    }
  },
  {
    id: 'mars',
    name: 'Sao Hỏa',
    tagline: 'Hành tinh đỏ',
    description: 'Bề mặt đầy bụi sắt oxit tạo nên màu đỏ đặc trưng. Có ngọn núi lửa Olympus Mons cao nhất hệ mặt trời.',
    distance: '227.9M km',
    orbit: '687 ngày',
    gravity: '3.721 m/s²',
    temperature: '-65°C',
    image: 'https://media-cdn-v2.laodong.vn/storage/newsportal/2020/7/13/819390/15.jpg?w=660',
    color: '#ef4444',
    order: 'Hành tinh thứ 4',
    details: {
      overview: 'Sao Hỏa là hành tinh đất đá với bầu khí quyển mỏng. Nó có các đặc điểm bề mặt gợi nhớ đến các hố va chạm trên Mặt Trăng và các thung lũng, sa mạc, chỏm băng cực của Trái Đất.',
      structure: 'Giống như Trái Đất, Sao Hỏa đã trải qua quá trình phân hóa, tạo ra lõi kim loại đặc được bao phủ bởi các vật liệu ít đặc hơn. Lõi chủ yếu là sắt và niken.',
      surface: 'Bề mặt Sao Hỏa có màu đỏ do sắt oxit (rỉ sét). Nó sở hữu hẻm núi Valles Marineris khổng lồ và ngọn núi lửa Olympus Mons cao gấp 3 lần đỉnh Everest.'
    }
  },
  {
    id: 'jupiter',
    name: 'Sao Mộc',
    tagline: 'Hành tinh lớn nhất',
    description: 'Hành tinh khí khổng lồ lớn nhất Hệ Mặt Trời. Nó có Vết Đỏ Lớn - một cơn bão khổng lồ đã tồn tại hàng thế kỷ.',
    distance: '778.5M km',
    orbit: '11.9 năm',
    gravity: '24.79 m/s²',
    temperature: '-110°C',
    image: 'https://space-facts.com/wp-content/uploads/jupiter.png',
    color: '#f59e0b',
    order: 'Hành tinh thứ 5',
    details: {
      overview: 'Sao Mộc là một hành tinh khí khổng lồ, chủ yếu là hydro và heli. Nó có từ trường cực mạnh và hàng chục vệ tinh tự nhiên.',
      structure: 'Không có bề mặt rắn. Lõi có thể là đá đặc, bao quanh bởi hydro kim loại lỏng và lớp khí quyển hydro-heli bên ngoài.',
      surface: 'Bề mặt là những dải mây đầy màu sắc và các cơn bão dữ dội. Vết Đỏ Lớn là đặc điểm nhận dạng nổi tiếng nhất.'
    }
  },
  {
    id: 'saturn',
    name: 'Sao Thổ',
    tagline: 'Chúa tể của nhẫn',
    description: 'Nổi tiếng với hệ thống vành đai phức tạp và lộng lẫy nhất. Là hành tinh khí khổng lồ thứ hai.',
    distance: '1.4 tỷ km',
    orbit: '29.5 năm',
    gravity: '10.44 m/s²',
    temperature: '-138°C',
    image: 'https://space-facts.com/wp-content/uploads/saturn.png',
    color: '#eab308',
    order: 'Hành tinh thứ 6',
    details: {
      overview: 'Sao Thổ là hành tinh lớn thứ hai trong Hệ Mặt Trời. Nó là một hành tinh khí khổng lồ với bán kính trung bình gấp khoảng 9 lần Trái Đất.',
      structure: 'Sao Thổ chủ yếu gồm hydro và heli. Nó có lõi sắt-niken và đá, được bao quanh bởi hydro kim loại lỏng và một lớp hydro phân tử bên ngoài.',
      surface: 'Là hành tinh khí, Sao Thổ không có bề mặt rắn thực sự. Bầu khí quyển bên trên có các dải mây vàng và xanh do tinh thể amoniac.'
    }
  },
  {
    id: 'uranus',
    name: 'Sao Thiên Vương',
    tagline: 'Hành tinh băng khổng lồ',
    description: 'Hành tinh thứ bảy từ Mặt Trời. Nó có trục quay nghiêng rất lớn, khiến nó trông như đang lăn trên quỹ đạo.',
    distance: '2.9 tỷ km',
    orbit: '84 năm',
    gravity: '8.69 m/s²',
    temperature: '-195°C',
    image: 'https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/01/uranus-la-sao-gi.jpg',
    color: '#22d3ee',
    order: 'Hành tinh thứ 7',
    details: {
      overview: 'Sao Thiên Vương là một hành tinh băng khổng lồ. Bầu khí quyển của nó chứa nhiều băng như nước, amoniac và metan.',
      structure: 'Gồm lõi đá nhỏ, manti băng (nước, amoniac, metan) và lớp vỏ hydro/heli mỏng bên ngoài.',
      surface: 'Bầu khí quyển có màu xanh lơ do khí metan hấp thụ ánh sáng đỏ. Nó có hệ thống vành đai mờ nhạt và nhiều vệ tinh.'
    }
  },
  {
    id: 'neptune',
    name: 'Sao Hải Vương',
    tagline: 'Hành tinh xa nhất',
    description: 'Hành tinh xa nhất trong Hệ Mặt Trời. Nó có những cơn gió mạnh nhất, đạt tốc độ hơn 2,000 km/h.',
    distance: '4.5 tỷ km',
    orbit: '164.8 năm',
    gravity: '11.15 m/s²',
    temperature: '-201°C',
    image: 'https://space-facts.com/wp-content/uploads/neptune.png',
    color: '#3b82f6',
    order: 'Hành tinh thứ 8',
    details: {
      overview: 'Sao Hải Vương là hành tinh thứ tám và xa nhất tính từ Mặt Trời. Nó có khối lượng gấp 17 lần Trái Đất.',
      structure: 'Tương tự Sao Thiên Vương, nó gồm lõi đá, manti băng và khí quyển hydro-heli. Nó có nguồn nhiệt nội tại mạnh.',
      surface: 'Bầu khí quyển màu xanh đậm rực rỡ. Nó có những cơn bão lớn như Vết Đen Lớn và các đám mây trắng cao vút.'
    }
  }
];

export const SIM_OBJECTS: SimulationObject[] = [
  { id: 'apple', name: 'Quả Táo', icon: 'apple', mass: 0.2, drag: 0.5 },
  { id: 'feather', name: 'Lông Vũ', icon: 'feather', mass: 0.01, drag: 5.0 },
  { id: 'astronaut', name: 'Phi Hành Gia', icon: 'user', mass: 80, drag: 1.0 }
];

export const ENVIRONMENTS: Environment[] = [
  { id: 'earth', name: 'Trái Đất', gravity: 9.8, color: '#13c8ec' },
  { id: 'moon', name: 'Mặt Trăng', gravity: 1.6, color: '#94a3b8' },
  { id: 'jupiter', name: 'Sao Mộc', gravity: 24.8, color: '#f59e0b' }
];
