import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Picanha Bovina Premium',
    details: 'Peça selecionada',
    price: 69.90,
    unit: 'KG',
    image: '/produtos/Picanha.png',
    isHighlight: true
  },
  {
    id: '2',
    name: 'Coxa com Sobrecoxa',
    details: '',
    price: 10.99,
    unit: 'KG',
    image: '/produtos/CoxaComSobrecoxa.png',
    isHighlight: false
  },
  {
    id: '3',
    name: 'Acém Bovino Picado',
    details: '',
    price: 18.99,
    unit: 'KG',
    image: '/produtos/AcemPicado.png',
    isHighlight: false
  },
  {
    id: '4',
    name: 'Linguiça Toscana',
    details: '',
    price: 22.50,
    unit: 'PCT',
    image: '/produtos/LinguicaToscana.png',
    isHighlight: false
  },
  {
    id: '5',
    name: 'Bife de Chorizo',
    details: 'Maturado',
    price: 39.90,
    unit: 'KG',
    image: '/produtos/BifeChorizo.png',
    isHighlight: false
  }
];

export const MOCK_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCrz7rcyzMeuzQqeRxa2Y9KQeIxMpeuoy826gFjKcvBHCcAYOFJCAZcQN7gjY00hLPANvDEVaZkefkHs60CsWQNMccv2QOfPJ9nqHniezyG6-VctLolXISgOb3Y6JxWsiLRF8EUalBzVjS9fXwdiRZWfdaaPYdxMOfI3JRAHjfxWy5qCnKM4kwfTixPlVtQ5RIoaVZp__N6zvDym09uXjfYDklXA-Rzwt2ODxw1wKwcMjcJL3Y4UVEsklg3Lcf2GWQYWObFnNDC',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDX-tCii68Y2qGuGCC-RUiPevH4Omc9OHnO_XRvLVbG43I83-fHSkdKafbOUjpg5EtOOOdKfM0KC5dLcQY--Ln6aU836TCLY2Hm9yFv1mtUOrGu9P6pa0Sy-ilXOxPRiUDYleUlQ29z1wc4XQRuaabGlXc2cWsOH-al7QPzgRjERBbkk0TXtWcmUvEinTRVff2fjSm62BbSYPFrt3k4VrdmURJPzDzhKzHjNFSa_TsU3cbeRZACM6lQE6u_suUTuWLrnl2ytgWO',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBrDMgWE2mOMyLuvLfCZbsykSFF_19TMopdXvkfghBXyCvtTx3ZF7BPf1wkYF1EdvlnPow79G6JDr3rrArXf2J7Nr6PiWvdlORz_KdGk9W1sQ0knUuz3PM39T3RkqF918IqumkIC2mhBQhBQnZcBH3g8VviC7SZ26BWAKy9RQT7CxKMDASysFyE2m41kBs1zMK5V8giMFklFMyxGuaCI-BMUKxNB61U0UnS4X6QjdPhULjMre3wrEnWozpIODGoJna8wjeV6WLN',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCmtPdZBJ10TvsnnDAwHyAydYQHxJI1kho93rm4XGoI6T2i-eU-MTXC0TsxW7WpYmtrJGgr47th4RBmSmz71x8YwUj2XiUxOZTYFnfJ90l2lxdJ8IlqbMiSoouLFPwyLOC1tPNvJkR39t7lHW6DijZHAbezgmJOxb7wWpnmmgEjjRjcBW4Nt16mojQ39o9YamjJxxGGpw21pyLwbU_fzrbXCgWKrfbngRDV5wRqeupyBrBRnDsThxs2Ztxf9HXer3FPuWmV_wBI',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuATi4W6R-ug-DJL9MIb13HxIO4U9e8JojzDOzsHjDRdMmonZN-9CLn_7GTyx38qvsEDNgOmWvovhk4pDHtzJV4AHAbCSCI7Otj18cGtvGQp5kvzfYJ474jRPq_lL0_MaJ8D1yr7UjytVimlTRG1rtYn8DBW_RrAX9Fezg6cXe6UKu31dXCk7EHJjbgWJIfhw7WKOU7qqVFyMr_0qTJkarLdRq788HFNqhFRZF96XzaaHLSoYDX2VnWy8NfXDNClvMesBcK7cben'
];