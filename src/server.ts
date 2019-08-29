import app from './app';

app.listen(app.get('port'), '0.0.0.0');
console.log('LocalMockSNNodeAPI is running at http://0.0.0.0:%d in %s mode")', app.get('port'), app.get('env'));