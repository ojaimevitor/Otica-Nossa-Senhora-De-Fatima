/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminAppointments from './pages/AdminAppointments';
import AdminCoupons from './pages/AdminCoupons';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import AdminUsers from './pages/AdminUsers';
import Cart from './pages/Cart';
import Category from './pages/Category';
import Checkout from './pages/Checkout';
import Exams from './pages/Exams';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Product from './pages/Product';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Support from './pages/Support';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminAppointments": AdminAppointments,
    "AdminCoupons": AdminCoupons,
    "AdminDashboard": AdminDashboard,
    "AdminOrders": AdminOrders,
    "AdminProducts": AdminProducts,
    "AdminUsers": AdminUsers,
    "Cart": Cart,
    "Category": Category,
    "Checkout": Checkout,
    "Exams": Exams,
    "Favorites": Favorites,
    "Home": Home,
    "Orders": Orders,
    "Product": Product,
    "Profile": Profile,
    "Search": Search,
    "Support": Support,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};