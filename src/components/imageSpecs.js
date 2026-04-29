/**
 * IMAGE SPECIFICATION MAP
 * Centralized image size requirements for the entire admin panel.
 * Every upload across the system references this map.
 */
const IMAGE_SPECS = {
    event_banner: {
        label: 'Event Slideshow Banner',
        width: 1920,
        height: 600,
        aspectRatio: '16:5',
        maxFileSize: 5 * 1024 * 1024, // 5MB
        formats: ['image/jpeg', 'image/png', 'image/webp'],
        description: 'Used in hero slider, event cards & detail panels',
        icon: '🖼️',
    },
    event_card_thumbnail: {
        label: 'Event Card Thumbnail',
        width: 800,
        height: 600,
        aspectRatio: '4:3',
        maxFileSize: 3 * 1024 * 1024,
        formats: ['image/jpeg', 'image/png', 'image/webp'],
        description: 'Displayed in event grid cards (auto-cropped)',
        icon: '🎴',
    },
    slideshow_banner: {
        label: 'Slideshow Banner',
        width: 1920,
        height: 600,
        aspectRatio: '16:5',
        maxFileSize: 5 * 1024 * 1024,
        formats: ['image/jpeg', 'image/png', 'image/webp'],
        description: 'Full-width hero slideshow on the homepage',
        icon: '🎞️',
    },
    speaker_photo: {
        label: 'Speaker Profile Photo',
        width: 600,
        height: 720,
        aspectRatio: '5:6',
        maxFileSize: 3 * 1024 * 1024,
        formats: ['image/jpeg', 'image/png', 'image/webp'],
        description: 'Displayed on speaker cards in portrait mode',
        icon: '👤',
    },
    website_logo: {
        label: 'Brand Logo',
        width: 512,
        height: 512,
        aspectRatio: '1:1',
        maxFileSize: 2 * 1024 * 1024,
        formats: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
        description: 'Square logo for header, sidebar & favicon zone',
        icon: '🏷️',
    },
    favicon: {
        label: 'Favicon',
        width: 64,
        height: 64,
        aspectRatio: '1:1',
        maxFileSize: 512 * 1024,
        formats: ['image/png', 'image/x-icon', 'image/svg+xml'],
        description: 'Browser tab icon (ICO, PNG, or SVG)',
        icon: '⭐',
    },
    poster_template: {
        label: 'Registration Success Poster',
        width: 1080,
        height: 1350,
        aspectRatio: '4:5',
        maxFileSize: 5 * 1024 * 1024,
        formats: ['image/jpeg', 'image/png', 'image/webp'],
        description: 'Certificate/poster background after registration',
        icon: '📜',
    },
    poster_logo: {
        label: 'Poster Brand Logo',
        width: 300,
        height: 300,
        aspectRatio: '1:1',
        maxFileSize: 1 * 1024 * 1024,
        formats: ['image/png', 'image/svg+xml', 'image/webp'],
        description: 'Logo embedded in the success poster',
        icon: '🔖',
    },
    success_banner: {
        label: 'Registration Success Banner',
        width: 1200,
        height: 400,
        aspectRatio: '3:1',
        maxFileSize: 3 * 1024 * 1024,
        formats: ['image/jpeg', 'image/png', 'image/webp'],
        description: 'Banner shown after successful registration',
        icon: '🎉',
    },
    template_banner: {
        label: 'Template Banner',
        width: 1440,
        height: 480,
        aspectRatio: '3:1',
        maxFileSize: 4 * 1024 * 1024,
        formats: ['image/jpeg', 'image/png', 'image/webp'],
        description: 'General template/email header banner',
        icon: '📧',
    }
};

export default IMAGE_SPECS;
