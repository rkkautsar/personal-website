import { h } from "preact";
import styled from 'preact-emotion';
import data from "./data";

export default function Experiences() {
  return (
    <Container>
      {data.companies.map(company => (
        <CompanyContainer>
          <a href={company.link} target="_blank"><h2>{company.name}</h2></a>
          <h3>{company.title} {company.current ? '[Current]' : null}</h3>
          {company.works.map(work => (
            <WorkContainer>
              <h4>{work.title}</h4>
              <p>{work.description}</p>
              {work.tags.map(tag => <Tag>{tag}</Tag>)}
            </WorkContainer>
          ))}
        </CompanyContainer>
      ))}
    </Container>
  );
}

const Container = styled('div')`
  flex: 1;
  overflow-y: auto;
`;

const WorkContainer = styled('div')`
  margin-left: 1rem;

  & + & {
    margin-top: 1rem;
  }
`;

const CompanyContainer = styled('div')`
  & + & {
    margin-top: 2rem;
  }
`;

const Tag = styled('mark')`
  border-radius: .25rem;
  line-height: 2;
  background: rgba(255, 255, 0, 0.4);
  padding: .25rem;
  & + & {
    margin-left: 1rem;
  }
`;