import objectPath from 'object-path';

export default
objectPath.get(process.env, 'BUILD_GIT_COMMIT', '');
