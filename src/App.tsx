/**
 * Placeholder application shell. Later migration stages replace the inner
 * markup with the header, router outlet and footer.
 *
 * The theme class (`default` | `night` | `amoledblack`) is applied to the
 * outermost element, exactly like the Angular `AppComponent` template did.
 */
export default function App() {
    const theme = 'default';

    return (
        <div className={theme}>
            <div className="body-cover" />
            <div className="wrapper">
                <h1>Hacker News</h1>
            </div>
        </div>
    );
}
