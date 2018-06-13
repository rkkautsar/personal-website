import { h } from 'preact';
import { Link } from 'preact-router/match';
import styled from 'preact-emotion';

const HeaderContainer = styled('header')`
  display: flex;
  width: 100%;
  height: 3.5rem;
  margin-bottom: 1rem;
  align-items: center;
  ${({ border }) =>
    border && 'border-bottom: 1px solid rgba(50, 50, 50, 0.25)'};

  @media (max-width: 48rem) {
    padding-bottom: 1rem;
    flex-direction: column;
    height: auto;
  }
`;

const Nav = styled('nav')`
  flex: 1;
  display: flex;
  justify-content: flex-end;

  a {
    margin: 0;
    margin-left: 1rem;
  }

  @media (max-width: 30rem) {
    flex-direction: column;
    text-align: center;

    a {
      margin: 0;
      margin-top: 1rem;
    }
  }
`;

export default function Header({ isHome }) {
  const NAV_LINKS = {
    '/projects': 'Projects',
    '/experiences': 'Experiences'
  };

  return (
    <HeaderContainer border={isHome}>
      {isHome && (
        <Link href="/" activeClassName="active">
          <h1>rkkautsar.</h1>
        </Link>
      )}
      <Nav>
        {Object.entries(NAV_LINKS).map(([path, label]) => (
          <Link key={path} href={path} activeClassName="active">
            {label}
          </Link>
        ))}
      </Nav>
    </HeaderContainer>
  );
}
