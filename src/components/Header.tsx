import logo from '../assets/iQUAVIS_logo.png';

export const HEADER_WIDTH_PX = 1200;

const Header = () => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 16px',
      background: '#000000',
      color: '#fff',
      height: '40px',
      // width: `${HEADER_WIDTH_PX}px`, // 너비 설정
      width: '100dvw', // 너비 설정
      minWidth: '400px' // 최소 너비 설정
    }}>
      <img src={logo} alt="Logo" style={{ height: '28px', marginRight: 16 }} />
      <center><h1 style={{ flex: 1, fontSize: '1.2rem', margin: 0 }}>iQUAVIS Toolkit</h1></center>
      <h1 style={{ fontSize: '0.9rem' }}>USER ABC</h1>
    </header>
  );
};
export default Header;
