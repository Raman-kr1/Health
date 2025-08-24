import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
import pandas as pd

class PredictionService:
    def __init__(self):
        self.models = {}
    
    async def predict_health_trends(self, health_data: list):
        if len(health_data) < 3:
            return {"error": "Insufficient data for prediction"}
        
        # Convert to DataFrame
        df = pd.DataFrame(health_data)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values('timestamp')
        
        # Create time index
        df['time_index'] = range(len(df))
        
        predictions = {}
        metrics = ['heart_rate', 'blood_pressure_systolic', 'weight']
        
        for metric in metrics:
            if metric in df.columns and df[metric].notna().sum() > 2:
                # Simple linear regression
                X = df['time_index'].values.reshape(-1, 1)
                y = df[metric].fillna(method='ffill').values
                
                model = LinearRegression()
                model.fit(X, y)
                
                # Predict next 7 days
                future_indices = np.array(range(len(df), len(df) + 7)).reshape(-1, 1)
                future_predictions = model.predict(future_indices)
                
                predictions[metric] = {
                    'current_trend': 'increasing' if model.coef_[0] > 0 else 'decreasing',
                    'next_7_days': future_predictions.tolist(),
                    'trend_strength': abs(model.coef_[0])
                }
        
        return predictions