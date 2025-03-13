import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import AppNavigator from "./navigators/AppNavigator";
import { PaperProvider } from "react-native-paper";

const App = () => {
	return (
		<PaperProvider>
			<AuthProvider>
				<AppNavigator />
			</AuthProvider>
		</PaperProvider>
	);
};

export default App;