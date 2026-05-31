export type Restaurant = {
  id: string;
  name: string;
  type: string;
  location: string;
  city: string;
  description: string;
  capacity: number;
  isAvailable: boolean;
  img: string;
};

export const RESTAURANTS: Restaurant[] = [
  { id: '1', name: 'Гасова лямпа', type: 'Кафе', location: 'вул. Вірменська, 20', city: 'Львів', description: 'Перша в Україні музей-ресторація. Атмосфера старого Львова та величезна колекція лямп.', capacity: 2, isAvailable: true, img: '/gasova-lyampa.jpg' },
  { id: '2', name: 'Реберня під Арсеналом', type: 'Ресторан', location: 'вул. Підвальна, 5', city: 'Львів', description: 'Найвідоміші ребра Львова, що готуються на відкритому вогні.', capacity: 4, isAvailable: true, img: '/rebernya.jpg' },
  { id: '3', name: 'Криївка', type: 'Ресторан', location: 'Площа Ринок, 14', city: 'Львів', description: 'Останній сховок вояків УПА, де панує особливий патріотичний дух.', capacity: 6, isAvailable: false, img: '/kryivka.jpg' },
  { id: '4', name: 'ПЕРША ЛЬВІВСЬКА ГРИЛЬОВА РЕСТОРАЦІЯ М\'ЯСА ТА СПРАВЕДЛИВОСТІ', type: 'Ресторан', location: 'вул. Валова, 20', city: 'Львів', description: 'Заклад про львівського ката. М’ясо на грилі та середньовічна атмосфера.', capacity: 4, isAvailable: true, img: '/meat-and-justice.jpg' },
  { id: '5', name: 'GRAND CAFE LEOPOLIS', type: 'Кафе', location: 'пл. Ринок, 1', city: 'Львів', description: 'Кафе у Ратуші з найкращим видом та десертами.', capacity: 2, isAvailable: true, img: '/grand-cafe.jpeg' },
  { id: '6', name: 'ЛЬВІВСЬКА КОПАЛЬНЯ КАВИ', type: 'Кав\'ярня', location: 'пл. Ринок, 10', city: 'Львів', description: 'Тут каву видобувають прямо з шахти під площею Ринок.', capacity: 4, isAvailable: true, img: '/kopalnya-kavy.jpg' },
  { id: '7', name: 'MARINAD MEAT BAR', type: 'Бар', location: 'вул. Личаківська, 135', city: 'Львів', description: 'Сучасний м’ясний бар з авторськими коктейлями.', capacity: 6, isAvailable: true, img: '/marinad-meat-bar.jpg' },
  { id: '10', name: 'ДЗИҐА', type: 'Кафе', location: 'вул. Вірменська, 35', city: 'Львів', description: 'Мистецьке серце Львова. Джаз, виставки та смачна кухня.', capacity: 4, isAvailable: true, img: '/dzyga.jpg' },
  { id: '11', name: 'НАЙДОРОЖЧА РЕСТОРАЦІЯ ГАЛИЧИНИ', type: 'Ресторан', location: 'пл. Ринок, 14/8', city: 'Львів', description: 'Масонська ложа з таємним входом та особливими цінами.', capacity: 2, isAvailable: true, img: '/expensive-rest.jpg' },
  { id: '12', name: 'ДОБРИЙ ДРУГ', type: 'Паб', location: 'вул. Лесі Українки, 19', city: 'Львів', description: 'Затишний паб з крафтовим пивом та піцою.', capacity: 6, isAvailable: true, img: '/dobryi-drug.jpg' },
  { id: '13', name: 'ГРУШЕВСЬКИЙ', type: 'Ресторан', location: 'пр-т Шевченка, 28', city: 'Львів', description: 'Кіно-джаз ресторан у самому центрі міста.', capacity: 4, isAvailable: true, img: '/hrushevskyi.jpg' },
  { id: '14', name: 'Bullart', type: 'Ресторан', location: 'пр-т Маяковського, 6', city: 'Запоріжжя', description: 'Найкращі стейки у Запоріжжі.', capacity: 4, isAvailable: true, img: '/bull.jpeg' },
  { id: '15', name: 'Шелест', type: 'Ресторан', location: 'бульвар Шевченка, 16', city: 'Запоріжжя', description: 'Найкращі стейки у Запоріжжі.', capacity: 4, isAvailable: true, img: '/shelest.jpg' },
  { id: '16', name: 'Бергамот', type: 'Ресторан', location: 'вулиця Перемоги, 59', city: 'Запоріжжя', description: 'Найкращі стейки у Запоріжжі.', capacity: 4, isAvailable: true, img: '/bergamot.jpg' },
  { id: '17', name: 'Джобс кафе', type: 'Кафе', location: 'проспект Соборний, 147', city: 'Запоріжжя', description: 'Найкращі стейки у Запоріжжі.', capacity: 4, isAvailable: true, img: '/jobs-cafe.jpg' },
  { id: '18', name: 'Тепло', type: 'Кафе', location: 'проспект Соборний, 166', city: 'Запоріжжя', description: 'Найкращі стейки у Запоріжжі.', capacity: 4, isAvailable: true, img: '/teplo.jpg' },
  { id: '19', name: 'Вілла Олива', type: 'Ресторан', location: 'вулиця Перемоги, 37', city: 'Запоріжжя', description: 'Найкращі стейки у Запоріжжі.', capacity: 4, isAvailable: true, img: '/villa-oliva.jpg' },
  { id: '20', name: 'Пузата Хата', type: 'Кафе', location: 'Хрещатик, 15', city: 'Київ', description: 'Традиційна українська кухня у швидкому форматі.', capacity: 6, isAvailable: true, img: 'https://via.placeholder.com/400x250?text=Пузата+Хата' },
];

export function getRestaurantById(id: string) {
  return RESTAURANTS.find((restaurant) => restaurant.id === id);
}
