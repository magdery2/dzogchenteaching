module.exports = {
  eleventyComputed: {
    permalink: (data) => `wisdom-blog-${data.page.fileSlug}.html`,
    metaTitle: (data) => `${data.title} - Wisdom Blog - Vajragarbha`,
    href: (data) => `wisdom-blog-${data.page.fileSlug}.html`,
  },
};
