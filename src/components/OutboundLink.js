import { h } from 'preact';
import ReactGA from 'react-ga';

export default function OutboundLink({ eventLabel, to, target, onClick, ...rest }) {
    const NEWTAB = '_blank';
    const MIDDLECLICK = 1;

    const handleClick = event => {
        const meta = { label: eventLabel };
        const sameTarget = target !== NEWTAB;
        const normalClick = !(event.ctrlKey || event.shiftKey || event.metaKey || event.button === MIDDLECLICK);
        if (sameTarget && normalClick) {
            event.preventDefault();
            ReactGA.outboundLink(meta, () => {
                console.log(to);
                window.location.href = to;
            });
        } else {
            ReactGA.outboundLink(meta, () => {});
        }

        if (onClick) {
            onClick(event);
        }
    }
    return <a href={to} onClick={handleClick} target={target} {...rest} />;
}