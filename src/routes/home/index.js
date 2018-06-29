import { h } from "preact";
import styled, { injectGlobal } from "preact-emotion";
import { getSVGIconUrl } from "../../utils";
import OutboundLink from "../../components/OutboundLink";

const socials = {
  medium: "https://medium.com/@rkkautsar",
  github: "https://github.com/rkkautsar",
  linkedin: "https://linkedin.com/in/rkkautsar",
  quora: "https://www.quora.com/profile/Rakha-Kanz-Kautsar"
};

const HomeContainer = styled("main")`
  flex: 1 0 auto;
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

const Button = styled(OutboundLink)`
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
  flex-shrink: 0;
  margin: 1rem;

  * + * {
    margin-left: 1rem;
  }
`;

const IconLink = styled(OutboundLink)`
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

const AvatarContainer = styled('div')`
  display: flex;
`;


export default function Home() {
  return (
    <HomeContainer>
      <AvatarContainer>
        <Avatar
          src="https://avatars2.githubusercontent.com/u/1536976"
          alt="avatar"
        />
      </AvatarContainer>
      <h1>Hi, I'm Rakha Kanz Kautsar</h1>
      <Subtitle>A full-stack software engineer striving for impact.</Subtitle>
      <Row>
        <Button to="//bit.ly/rakha-resume" eventLabel="resume" target="_blank">
          Resume
        </Button>
        <Button filled eventLabel="email" to="mailto:rkkautsar@gmail.com">
          Contact
        </Button>
      </Row>
      <Row>
        {Object.keys(socials).map(social => (
          <IconLink to={socials[social]} eventLabel={`${social}_from_social_icon`} target="_blank">
            <img src={getSVGIconUrl(social)} alt={social} title={social} />
          </IconLink>
        ))}
      </Row>
    </HomeContainer>
  );
}
