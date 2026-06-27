@include('blueprint.dashboard.dashboard')
@yield('blueprint.lib')

<!DOCTYPE html>
<html>
    <head>
        <title>HobbyServers</title>

        @yield('head')

        @section('meta')
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
            <meta name="csrf-token" content="{{ csrf_token() }}">
            <meta name="robots" content="noindex">
            <link rel="icon" type="image/png" href="https://icons.hobbyservers.gg/logos/sdffsfds.png">
            <link rel="apple-touch-icon" href="https://icons.hobbyservers.gg/logos/sdffsfds.png">
            <link rel="shortcut icon" href="https://icons.hobbyservers.gg/logos/sdffsfds.png">
            <meta name="theme-color" content="#101013">
        @show

        @section('user-data')
            @if(!is_null(Auth::user()))
                <script>
                    window.PterodactylUser = {!! json_encode(Auth::user()->toVueObject()) !!};
                </script>
            @endif
            @if(!empty($siteConfiguration))
                <script>
                    window.SiteConfiguration = {!! json_encode($siteConfiguration) !!};
                </script>
            @endif
        @show

        @yield('assets')

        @include('layouts.scripts')
    </head>
    <body class="{{ $css['body'] ?? 'bg-neutral-50' }}">
        @section('content')
            @yield('above-container')
            @yield('container')
            @yield('below-container')

            @yield('blueprint.wrappers')
        @show
        @section('scripts')
            {!! $asset->js('main.js') !!}
        @show
    </body>
</html>
