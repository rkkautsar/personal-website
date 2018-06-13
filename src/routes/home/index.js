import { h } from "preact";
import styled, { injectGlobal } from "preact-emotion";
import { getSVGIconUrl } from "../../utils";

const socials = {
  medium: "https://medium.com/@rkkautsar",
  github: "https://github.com/rkkautsar",
  linkedin: "https://linkedin.com/in/rkkautsar",
  quora: "https://www.quora.com/profile/Rakha-Kanz-Kautsar"
};

const HomeContainer = styled("main")`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const Avatar = styled("img")`
  margin: 1rem;
  border-radius: 100%;
  max-width: 100%;
  width: 10rem;
  height: 10rem;
`;

const Subtitle = styled("h3")`
  font-size: 1.414rem;
  font-weight: 400;
`;

const Button = styled("a")`
  text-transform: uppercase;
  padding: 0.4rem 2rem;
  border: 0.15rem solid #f28628;
  border-radius: 4rem;
  font-size: 1.414rem;
  color: #f28628;

  :visited {
    color: #f28628;
  }

  :hover {
    text-decoration: none;
    background: #f28628;
    color: #fff;
  }

  ${props =>
    props.filled &&
    `
    background: #f28628;
    color: #fff;

    :visited {
      color: #fff;
    }
  `};
`;

const Row = styled("div")`
  display: flex;
  flex-direction: row;
  margin: 1rem;

  * + * {
    margin-left: 1rem;
  }
`;

const IconLink = styled('a')`
  opacity: .5;
  transition: opacity .5s ease-in-out;

  :hover {
    opacity: 1;
  }

  img {
    width: 2rem;
    height: 2rem;
  }
`;


export default function Home() {
  return (
    <HomeContainer>
      <Avatar
        src="https://avatars2.githubusercontent.com/u/1536976"
        alt="avatar"
      />
      <h1>Hi, I'm Rakha Kanz Kautsar</h1>
      <Subtitle>A full-stack software engineer thriving for impact.</Subtitle>
      <Row>
        <Button href="//bit.ly/rakha-resume" target="_blank">
          Resume
        </Button>
        <Button filled href="mailto:rkkautsar@gmail.com">
          Contact
        </Button>
      </Row>
      <Row>
        {Object.keys(socials).map(social => (
          <IconLink href={socials[social]} target="_blank">
            <img src={getSVGIconUrl(social)} alt={social} />
          </IconLink>
        ))}
      </Row>
    </HomeContainer>
  );
}
