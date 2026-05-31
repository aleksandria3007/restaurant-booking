export type Restaurant = {
  id: string;
  name: string;
  type: string;
  location: string;
  city: string;
  cuisine: string;
  description: string;
  capacity: number;
  averageCheck: number;
  lat: number;
  lng: number;
  isAvailable: boolean;
  img: string;
};

export const RESTAURANTS: Restaurant[] = [
  { id: '1', name: 'Гасова лямпа', type: 'Кафе', location: 'вул. Вірменська, 20', city: 'Львів', cuisine: 'Українська', description: 'Перша в Україні музей-ресторація. Атмосфера старого Львова та величезна колекція лямп.', capacity: 6, averageCheck: 550, lat: 49.8433, lng: 24.0315, isAvailable: true, img: '/gasova-lyampa.jpg' },
  { id: '2', name: 'Реберня під Арсеналом', type: 'Ресторан', location: 'вул. Підвальна, 5', city: 'Львів', cuisine: 'Гриль', description: 'Найвідоміші ребра Львова, що готуються на відкритому вогні.', capacity: 6, averageCheck: 650, lat: 49.8420, lng: 24.0351, isAvailable: true, img: '/rebernya.jpg' },
  { id: '3', name: 'Криївка', type: 'Ресторан', location: 'Площа Ринок, 14', city: 'Львів', cuisine: 'Українська', description: 'Останній сховок вояків УПА, де панує особливий патріотичний дух.', capacity: 6, averageCheck: 520, lat: 49.8417, lng: 24.0317, isAvailable: false, img: '/kryivka.jpg' },
  { id: '4', name: 'ПЕРША ЛЬВІВСЬКА ГРИЛЬОВА РЕСТОРАЦІЯ М\'ЯСА ТА СПРАВЕДЛИВОСТІ', type: 'Ресторан', location: 'вул. Валова, 20', city: 'Львів', cuisine: 'Гриль', description: 'Заклад про львівського ката. М’ясо на грилі та середньовічна атмосфера.', capacity: 4, averageCheck: 700, lat: 49.8400, lng: 24.0338, isAvailable: true, img: '/meat-and-justice.jpg' },
  { id: '5', name: 'GRAND CAFE LEOPOLIS', type: 'Кафе', location: 'пл. Ринок, 1', city: 'Львів', cuisine: 'Європейська', description: 'Кафе у Ратуші з найкращим видом та десертами.', capacity: 2, averageCheck: 480, lat: 49.8419, lng: 24.0316, isAvailable: true, img: '/grand-cafe.jpeg' },
  { id: '6', name: 'ЛЬВІВСЬКА КОПАЛЬНЯ КАВИ', type: 'Кав\'ярня', location: 'пл. Ринок, 10', city: 'Львів', cuisine: 'Десерти', description: 'Тут каву видобувають прямо з шахти під площею Ринок.', capacity: 4, averageCheck: 350, lat: 49.8422, lng: 24.0310, isAvailable: true, img: '/kopalnya-kavy.jpg' },
  { id: '7', name: 'MARINAD MEAT BAR', type: 'Бар', location: 'вул. Личаківська, 135', city: 'Львів', cuisine: 'Бургери', description: 'Сучасний м’ясний бар з авторськими коктейлями.', capacity: 6, averageCheck: 500, lat: 49.8367, lng: 24.0578, isAvailable: true, img: '/marinad-meat-bar.jpg' },
  { id: '10', name: 'ДЗИҐА', type: 'Кафе', location: 'вул. Вірменська, 35', city: 'Львів', cuisine: 'Європейська', description: 'Мистецьке серце Львова. Джаз, виставки та смачна кухня.', capacity: 4, averageCheck: 430, lat: 49.8435, lng: 24.0323, isAvailable: true, img: '/dzyga.jpg' },
  { id: '11', name: 'НАЙДОРОЖЧА РЕСТОРАЦІЯ ГАЛИЧИНИ', type: 'Ресторан', location: 'пл. Ринок, 14/8', city: 'Львів', cuisine: 'Авторська', description: 'Масонська ложа з таємним входом та особливими цінами.', capacity: 2, averageCheck: 900, lat: 49.8417, lng: 24.0317, isAvailable: true, img: '/expensive-rest.jpg' },
  { id: '12', name: 'ДОБРИЙ ДРУГ', type: 'Паб', location: 'вул. Лесі Українки, 19', city: 'Львів', cuisine: 'Піца', description: 'Затишний паб з крафтовим пивом та піцою.', capacity: 6, averageCheck: 450, lat: 49.8436, lng: 24.0300, isAvailable: true, img: '/dobryi-drug.jpg' },
  { id: '13', name: 'ГРУШЕВСЬКИЙ', type: 'Ресторан', location: 'пр-т Шевченка, 28', city: 'Львів', cuisine: 'Європейська', description: 'Кіно-джаз ресторан у самому центрі міста.', capacity: 4, averageCheck: 620, lat: 49.8363, lng: 24.0312, isAvailable: true, img: '/hrushevskyi.jpg' },
  { id: '14', name: 'Bullart', type: 'Ресторан', location: 'пр-т Маяковського, 6', city: 'Запоріжжя', cuisine: 'Гриль', description: 'Стейковий ресторан із м’ясними стравами, винною картою та камерною атмосферою для вечері.', capacity: 4, averageCheck: 700, lat: 47.8388, lng: 35.1396, isAvailable: true, img: '/bull.jpeg' },
  { id: '15', name: 'Шелест', type: 'Ресторан', location: 'бульвар Шевченка, 16', city: 'Запоріжжя', cuisine: 'Європейська', description: 'Міський ресторан для зустрічей, сімейних вечерь і спокійного відпочинку в центрі міста.', capacity: 4, averageCheck: 520, lat: 47.8390, lng: 35.1310, isAvailable: true, img: '/shelest.jpg' },
  { id: '16', name: 'Бергамот', type: 'Ресторан', location: 'вулиця Перемоги, 59', city: 'Запоріжжя', cuisine: 'Італійська', description: 'Заклад із легкою європейською та італійською кухнею, пастою, салатами й десертами.', capacity: 4, averageCheck: 480, lat: 47.8427, lng: 35.1297, isAvailable: true, img: '/bergamot.jpg' },
  { id: '17', name: 'Джобс кафе', type: 'Кафе', location: 'проспект Соборний, 147', city: 'Запоріжжя', cuisine: 'Бургери', description: 'Неформальне кафе з бургерами, кавою та швидкими стравами для обіду або зустрічі.', capacity: 4, averageCheck: 320, lat: 47.8380, lng: 35.1372, isAvailable: true, img: '/jobs-cafe.jpg' },
  { id: '18', name: 'Тепло', type: 'Кафе', location: 'проспект Соборний, 166', city: 'Запоріжжя', cuisine: 'Українська', description: 'Затишне кафе з домашніми стравами, сніданками та теплим сервісом.', capacity: 4, averageCheck: 360, lat: 47.8377, lng: 35.1337, isAvailable: true, img: '/teplo.jpg' },
  { id: '19', name: 'Вілла Олива', type: 'Ресторан', location: 'вулиця Перемоги, 37', city: 'Запоріжжя', cuisine: 'Італійська', description: 'Ресторан італійського настрою з піцою, пастою та стравами для великої компанії.', capacity: 4, averageCheck: 540, lat: 47.8421, lng: 35.1265, isAvailable: true, img: '/villa-oliva.jpg' },
  { id: '20', name: 'Пузата Хата', type: 'Кафе', location: 'Хрещатик, 15', city: 'Київ', cuisine: 'Українська', description: 'Традиційна українська кухня у швидкому форматі.', capacity: 6, averageCheck: 280, lat: 50.4472, lng: 30.5227, isAvailable: true, img: 'https://via.placeholder.com/400x250?text=Пузата+Хата' },
];

export function getRestaurantById(id: string) {
  return RESTAURANTS.find((restaurant) => restaurant.id === id);
}
