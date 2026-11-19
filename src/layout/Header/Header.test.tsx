import { fireEvent, screen } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { renderWithProviders } from '../../test/renderWithProviders';
import { Header } from './Header';

function LocationProbe() {
    const location = useLocation();
    return <div data-testid="location">{location.pathname}</div>;
}

function renderHeader(route = '/news/1') {
    return renderWithProviders(
        <>
            <Header />
            <Routes>
                <Route path="*" element={<LocationProbe />} />
            </Routes>
        </>,
        { route }
    );
}

describe('Header', () => {
    beforeEach(() => {
        vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    });

    it('renders the logo home link and the feed nav links', () => {
        const { container } = renderHeader();

        expect(container.querySelector('header > #header')).toBeInTheDocument();
        expect(container.querySelector('.logo-inner')).toBeInTheDocument();
        expect(screen.getByAltText('Logo')).toHaveAttribute('src', '/assets/images/logo.svg');
        expect(screen.getByAltText('Logo').closest('a')).toHaveAttribute('href', '/news/1');

        const expected = [
            ['new', '/newest/1'],
            ['show', '/show/1'],
            ['ask', '/ask/1'],
            ['jobs', '/jobs/1'],
        ];
        for (const [label, href] of expected) {
            expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href);
        }
        expect(container.querySelector('.header-nav')).toHaveTextContent('new | show | ask | jobs');
    });

    it('marks the link for the current route as active', () => {
        renderHeader('/show/1');

        expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
        expect(screen.getByRole('link', { name: 'new' })).not.toHaveClass('active');
        expect(screen.getByAltText('Logo').closest('a')).not.toHaveClass('active');
    });

    it('marks the home link active on the news feed', () => {
        renderHeader('/news/1');

        expect(screen.getByAltText('Logo').closest('a')).toHaveClass('active');
    });

    it('navigates and scrolls to the top when a nav link is clicked', () => {
        renderHeader('/news/1');

        fireEvent.click(screen.getByRole('link', { name: 'ask' }));

        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        expect(screen.getByTestId('location')).toHaveTextContent('/ask/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveClass('active');
    });

    it('scrolls to the top when the home link is clicked', () => {
        renderHeader('/jobs/1');

        fireEvent.click(screen.getByAltText('Logo'));

        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        expect(screen.getByTestId('location')).toHaveTextContent('/news/1');
    });

    it('toggles the settings popup from the cog', () => {
        const { container } = renderHeader();
        const cog = screen.getByRole('button', { name: 'Settings' });
        expect(cog).toHaveAttribute('src', '/assets/images/cog.svg');
        expect(container.querySelector('.popup')).not.toBeInTheDocument();

        fireEvent.click(cog);
        expect(screen.getByRole('dialog')).toHaveClass('popup');

        fireEvent.click(cog);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('opens the settings popup from the keyboard', () => {
        renderHeader();

        fireEvent.keyDown(screen.getByRole('button', { name: 'Settings' }), { key: 'Enter' });

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
});
