import { Outlet } from 'react-router-dom';


const UserLayout = () => {
    return (
        <div className="app-container">
            <header>
                {/* {<HeaderComponent} */}
                <div>Header</div>
            </header>
            <main className="main-content">
                {/* Nội dung các route con */}
                <Outlet />
            </main>
            <footer>
                <div>Footer</div>
            </footer>
        </div>
    )
}
export default UserLayout