import CopyWebpackPlugin from 'copy-webpack-plugin'
import criticalCssPlugin from "preact-cli-plugin-critical-css";

export default (config, env) => {
    config.plugins.push( new CopyWebpackPlugin([{ context: `${__dirname}/src/assets`, from: '*' }]) );
    criticalCssPlugin(config, env);
}
