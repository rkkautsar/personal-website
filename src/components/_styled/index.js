import styled from 'preact-emotion';

export const Box = styled('div')`
  ${({ flex }) => flex && 'flex: 1'};
`;

export const Centering = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;
