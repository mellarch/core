import DefaultResolver from '../../common/resolvers/DefaultResolver';
import DiscussionPage from '../components/DiscussionPage';

/**
 * This isn't exported as it is a temporary measure.
 * A more robust system will be implemented alongside UTF-8 support in beta 15.
 */
function getDiscussionIdFromSlug(slug: string | undefined) {
  if (!slug) return;
  return slug.split('-')[0];
}

/**
 * A custom route resolver for DiscussionPage that generates the same key to all posts
 * on the same discussion. It triggers a scroll when going from one post to another
 * in the same discussion.
 */
export default class DiscussionPageResolver extends DefaultResolver {
  static scrollToPostNumber: string | null = null;

  makeKey() {
    const params = { ...m.route.param() };
    if ('near' in params) {
      delete params.near;
    }
    params.id = getDiscussionIdFromSlug(params.id);
    return this.routeName.replace('.near', '') + JSON.stringify(params);
  }

  onmatch(args, requestedPath, route) {
    if (app.current.matches(DiscussionPage) && getDiscussionIdFromSlug(args.id) === getDiscussionIdFromSlug(m.route.param('id'))) {
      // By default, the first post number of any discussion is 1
      DiscussionPageResolver.scrollToPostNumber = args.near || '1';
    }

    return super.onmatch(args, requestedPath, route);
  }

  render(vnode) {
    if (DiscussionPageResolver.scrollToPostNumber !== null) {
      const number = DiscussionPageResolver.scrollToPostNumber;
      // Scroll after a timeout to avoid clashes with the render.
      setTimeout(() => app.current.get('stream').goToNumber(number));
      DiscussionPageResolver.scrollToPostNumber = null;
    }

    return super.render(vnode);
  }
}
