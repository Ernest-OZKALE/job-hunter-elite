import { Component, type ReactNode } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ThemeProvider } from './context/ThemeContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { LoadingScreen } from './components/common/LoadingScreen';
import { ThemeApplier } from './components/ThemeApplier';
import { ToastProvider } from './context/ToastContext';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
	constructor(props: { children: ReactNode }) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: any) {
		console.error("ErrorBoundary caught an error", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div style={{ padding: '20px', color: 'red' }}>
					<h2>Quelque chose s'est mal passé.</h2>
					<p>Veuillez rafraîchir la page.</p>
				</div>
			);
		}
		return this.props.children;
	}
}

export default function JobTracker() {
	const { user, loading, login, logout } = useAuth();

	if (loading) return <LoadingScreen />;

	return (
		<ErrorBoundary>
			<ThemeProvider>
				<PreferencesProvider>
					<ThemeApplier />
					<ToastProvider>
						{!user ? (
							<LoginPage onLogin={login} />
						) : (
							<DashboardPage user={user} onLogout={logout} />
						)}
					</ToastProvider>
				</PreferencesProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}
